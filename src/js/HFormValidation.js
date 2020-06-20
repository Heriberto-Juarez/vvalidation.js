"use strict";

const rulesPack = {
    'alpha': /^[a-zA-Z]+$/,
    'alpha_space': /^[a-zA-Z\s]+$/,
    'alpha_dash': /^[a-zA-Z_]+$/,
    'alpha_numeric': /^[a-zA-Z0-9]+$/,
    'alpha_numeric_space': /^[a-zA-Z0-9\s]+$/,
    'alpha_numeric_punct': /^[a-zA-Z0-9\~\!\#\$\%\&\*\-\_\+\=\|\:\.]+$/,
    'decimal': /^[-+]?\d+(?:[,.]\d+)*$/,
    'hexadecimal': /^[0-9a-fA-F]+$/,
    'integer': /^[0-9]+$/
};

const errors = {
    'es': {
        'alpha': 'Ingrese únicamente valores alfabéticos sin espacios',
        'alpha_space': 'Ingrese únicamente valores alfabéticos y espacios',
        'alpha_dash': 'Ingrese únicamente valores alfabéticos y guiones',
        'alpha_numeric': 'Ingrese únicamente valores alfabéticos y numéricos sin espacio',
        'alpha_numeric_space': 'Ingrese únicamente valores alfabéticos, numéricos y espacios',
        'alpha_numeric_punct': 'Ingrese únicamente valores alfabéticos, numéricos y los siguientes signos de puntuación: ~ ! # $ % & * - _ + = | : .',
        'decimal': 'Ingrese únicamente valores decimales',
        'hexadecimal': 'Ingrese únicamente valores hexadecimales',
        'integer': 'Ingrese únicamente valores enteros',
    },
    'en': {
        'alpha': 'Enter alphabetic values only (without spaces)',
        'alpha_space': 'Enter alphabetic values and spaces only',
        'alpha_dash': 'Enter alphabetic values and dashes only',
        'alpha_numeric': 'Enter alphabetic and numeric values only',
        'alpha_numeric_space': 'Enter alphabetic, numeric, and spaces values only',
        'alpha_numeric_punct': 'Enter alphabetic and numeric values, and the following symbols: ~ ! # $ % & * - _ + = | : . only',
        'decimal': 'Enter decimal values only',
        'hexadecimal': 'Enter hexadecimal values only',
        'integer': 'Enter integer values only',
    },
};

const parametersRegex = new RegExp(/(?<=\[).+?(?=\])/);


class HFormValidation {
    constructor(id, settings) {
        this.form = document.getElementById(id);
        this.submitBtn = this.form.querySelector("input[type='submit']");
        if (this.submitBtn === null) {
            this.submitBtn = this.form.querySelector('[data-submit]');
        }
        this.allowedFileTypes = "image/*";
        this.hasModal = true;
        this.modal = document.getElementById("HFormModal");
        this.isValid = true;
        this.lang = 'en';
        this.handleFormSubmition = true;
        this.typingSeconds = 1;
        settings = settings || {};
        for (let key in settings) this[key] = settings[key]; //assign settings to HForm object
        this.validateAll();
        this.attachEventHandlers();
    }

    attachEventHandlers() {
        const inputs = this.form.querySelectorAll('[data-hfrules]');
        inputs.forEach((el) => {
            this.isValid = true;

            if (el.getAttribute("type") !== null && el.getAttribute("type") === "file") {
                el.addEventListener("change", () => {
                    this.validateAndUpdate(el);
                });
            } else {
                let typingTimer;
                el.addEventListener('keyup', () => {
                    clearTimeout(typingTimer);
                    typingTimer = setTimeout(() => {
                        this.validateAndUpdate(el);
                    }, this.typingSeconds * 1000);
                });
                el.addEventListener('keydown', function () {
                    clearTimeout(typingTimer);
                });
            }
        });
    }

    validateAndUpdate(el){
        this.validateElement(el);
        this.toggleSubmitButton();
    }


    validateAll() {
        const inputs = this.form.querySelectorAll('[data-hfrules]')
        inputs.forEach((el) => {
            el.dataset.hfvid = "true";
            this.validateElement(el);
            this.observe(el);
        });
        this.toggleSubmitButton();
    }

    validateElement(el) {
        this.isValid = true;
        const nodeName = el.nodeName;
        const rules = el.getAttribute('data-hfrules').split('|');
        let value = nodeName === 'select' ? el.options[el.selectedIndex].value : el.value;

        for (let index in rules) {
            const rule = rules[index].toLowerCase();
            if (rule !== 'permit_empty' && rule !== 'required') {
                /**
                 * If regex is min_length or max_length get parameter and validate
                 **/

                let minRegex = new RegExp(/^min_length/);
                let maxRegex = new RegExp(/^max_length/);
                let type = '';
                if (rule.match(minRegex))
                    type = 'min';
                else if (rule.match(maxRegex))
                    type = 'max';

                if (type !== '') {
                    let parameterValue = '';
                    try {
                        parameterValue = parametersRegex.exec(rule)[0];
                    } catch (e) {
                        throw new Error(`The ${type}_length's parameter could not be read. Please check you are using the following syntax: ${type}_length[INTEGER_VALUE]`);
                    }
                    if (parameterValue.match(new RegExp(rulesPack['integer']))) {
                        if (type === 'min') {
                            /**
                             * If permit empty is set, then min_length can be omitted
                             * */
                            if (value.length < parameterValue && !rules.includes('permit_empty')) {
                                this.isValid = false;
                            }
                        } else {
                            if (value.length > parameterValue) {
                                this.isValid = false;
                            }
                        }
                    } else
                        throw new Error(`${type}_length's parameter must be an integer`);

                } else {
                    /**
                     * The rule is not a length check. Let's try finding the rule in rulesPack object
                     * */
                    if (rulesPack.hasOwnProperty(rule)) {
                        /**
                         * rule exists, so we create a new Regex and check if it matches the input value.
                         * If the regex does not match the value we assign isValid to false;
                         * */
                        if (!(new RegExp(rulesPack[rule]).test(value)) && !rules.includes('permit_empty')) {
                            this.isValid = false;
                        }
                    }
                }
            } else if (rule === 'permit_empty' && value.length < 1) {
                this.isValid = true;
            } else if (rule === 'required') {
                /**
                 * If the rule indicates an element is required we must check if the value is empty
                 * But if the input is of type file then we should check the
                 * */
                if ((el.getAttribute("type") === 'file' && el.files.length < 1) || value.length < 1) {
                    this.isValid = false;
                }

            }
        }
        el.dataset.hfvid = this.isValid.toString();
    }
    /*
    * Checks event
    * */
    toggleSubmitButton() {
        if (this.submitBtn) {

            const inputs = this.form.querySelectorAll('[data-hfrules]');
            let isEnabled = true;
            inputs.forEach((el) => {
                if(el.dataset.hfvid === "false"){
                    isEnabled = false;
                }
            });

            if(isEnabled){
                this.submitBtn.removeAttribute("disabled");
            }else{
                this.submitBtn.setAttribute("disabled", "disabled");
            }

        } else {
            throw new Error('Could not find submit button, if you have something different than <input type="submit"> specify your input with data-submit attribute: <button data-submit>Submit</button>');
        }
    }

    /**
     * Observe for changes in attributes and check if they are valid or not
     * */
    observe(el){
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes") {
                    /**
                     * Attributes changed
                     * */

                    const val = el.dataset.hfvid;
                    //If attribute is not true or false it has been modified externally or something wrong happend
                    //So we set it to false
                    if(val !== "true" && val !== "false"){
                        el.dataset.hfvid = "false";
                        this.validateAndUpdate(el);
                    }
                }
            });
        });

        observer.observe(el, {
            attributes: true //configure it to listen to attribute changes
        });
    }

}