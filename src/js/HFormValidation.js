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
    'es':{
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
        if(this.submitBtn === null){
            this.submitBtn = this.form.querySelector('[data-submit]');
        }
        this.allowedFileTypes = "image/*";
        this.hasModal = true;
        this.modal = document.getElementById("HFormModal");
        this.isValid = true;
        this.lang = 'en';
        this.handleFormSubmition = true;
        settings = settings || {};
        for (let key in settings) this[key] = settings[key]; //assign settings to HForm object
        this.validate();
    }

    validate() {
        const inputs = this.form.querySelectorAll('[data-hfrules]')

        inputs.forEach((el) => {
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
                    if(rule.match(minRegex))
                        type = 'min';
                    else if (rule.match(maxRegex))
                        type = 'max';

                    if (type !== '') {
                        let parameterValue = '';
                        try {
                            parameterValue = parametersRegex.exec(rule)[0];
                        }catch (e) {
                            throw new Error(`The ${type}_length's parameter could not be read. Please check you are using the following syntax: ${type}_length[INTEGER_VALUE]`);
                        }
                        if(parameterValue.match(new RegExp(rulesPack['integer']))){
                            if(type === 'min')
                                if(value.length < parameterValue) this.isValid = false;
                                else
                                if(value.length > parameterValue) this.isValid = false;
                        }else
                            throw new Error(`${type}_length's parameter must be an integer`);

                    }else {
                        /**
                         * The rule is not a length check. Let's try finding the rule in rulesPack object
                         * */
                        if(rulesPack.hasOwnProperty(rule)){
                            /**
                             * rule exists, so we create a new Regex and check if it matches the input value.
                             * If the regex does not match the value we assign isValid to false;
                             * */
                            if(!(new RegExp(rulesPack[rule]).test(value))){
                                this.isValid = false;
                            }
                        }
                    }

                } else if (rule === 'permit_empty' && value.length < 1) {
                    this.isValid = true;
                } else if (rule === 'required'){
                    /**
                     * If the rule indicates an element is required we must check if the value is empty
                     * But if the input is of type file then we should check the
                     * */
                    if(el.getAttribute("type") === 'file' && el.files.length < 1 || value.length < 1)
                        this.isValid = false;
                }

            }
        });

        if(this.submitBtn){
            if(this.isValid){
                this.submitBtn.attributes.removeNamedItem('disabled');
            }else{
                this.submitBtn.attributes.disabled = "disabled";
            }
        }else {
            throw new Error('Could not find submit button, if you have something different than <input type="submit"> specify your input with data-submit attribute: <button data-submit>Submit</button>');
        }

    }


}