"use strict";
class VValidation {
    constructor(id, settings) {
        this.form = document.getElementById(id);
        this.submitBtn = this.form.querySelector("[type='submit']");
        if (this.submitBtn === null) this.submitBtn = this.form.querySelector('[data-submit]');
        try{
            this.modal = new bootstrap.Modal(document.getElementById("VVModal"));
        }catch (e) {
            this.modal = null;
        }
        this.isValid = true;
        this.lang = 'en';
        this.handleFormSubmission = true;
        this.typingSeconds = 0.50;
        this.enableScroll = true;
        settings = settings || {};
        for (let key in settings) this[key] = settings[key];
        this.validateAll(false);
        this.attachEventHandlers();
    }

    static rulesPack () {
        return {
            'alpha': /^[a-zA-Z]+$/,
            'alpha_space': /^[a-zA-Z\s]+$/,
            'alpha_dash': /^[a-zA-Z_]+$/,
            'alpha_numeric': /^[a-zA-Z0-9]+$/,
            'alpha_numeric_space': /^[a-zA-Z0-9\s]+$/,
            'alpha_numeric_punct': /^[a-zA-Z0-9\~\!\#\$\%\&\*\-\_\+\=\|\:\.]+$/,
            'decimal': /^[-+]?\d+(?:[,.]\d+)*$/,
            'hexadecimal': /^[0-9a-fA-F]+$/,
            'integer': /^[0-9]+$/,
            'valid_email': /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        };
    }

    static errors() {
        return {
            'es': {
                'alpha': 'Ingrese únicamente valores alfabéticos',
                'alpha_space': 'Ingrese únicamente valores alfabéticos y espacios',
                'alpha_dash': 'Ingrese únicamente valores alfabéticos y guiones',
                'alpha_numeric': 'Ingrese únicamente valores alfabéticos y numéricos',
                'alpha_numeric_space': 'Ingrese únicamente valores alfabéticos, numéricos y espacios',
                'alpha_numeric_punct': 'Ingrese únicamente valores alfabéticos, numéricos y los siguientes signos de puntuación: ~ ! # $ % & * - _ + = | : .',
                'decimal': 'Ingrese únicamente valores decimales',
                'hexadecimal': 'Ingrese únicamente valores hexadecimales',
                'integer': 'Ingrese únicamente valores enteros',
                'min_length': 'Ingrese al menos {0} caracteres',
                'max_length': 'Ingrese como máximo {0} caracteres',
                'required': 'Este campo es requerido',
                'min_length_files': 'Seleccione al menos {0} archivos',
                'max_length_files': 'Seleccione máximo {0} archivos',
                'max_size': 'Cada archivo debe pesar como máximo {0} Mb. El archivo {1} supera el límite.',
                'valid_email': 'Ingrese una dirección de correo electrónico valida'
            },
            'en': {
                'alpha': 'Enter alphabetic values only',
                'alpha_space': 'Enter alphabetic values and spaces only',
                'alpha_dash': 'Enter alphabetic values and dashes only',
                'alpha_numeric': 'Enter alphabetic and numeric values only',
                'alpha_numeric_space': 'Enter alphabetic, numeric, and spaces values only',
                'alpha_numeric_punct': 'Enter alphabetic and numeric values, and the following symbols: ~ ! # $ % & * - _ + = | : . only',
                'decimal': 'Enter decimal values only',
                'hexadecimal': 'Enter hexadecimal values only',
                'integer': 'Enter integer values only',
                'min_length': 'Enter at least {0} characters',
                'max_length': 'Enter maximum {0} characters',
                'required': 'This field is required',
                'min_length_files': 'Select at least {0} files',
                'max_length_files': 'Select maximum {0} files',
                'max_size': 'Each file must weigh maximum {0} Mb. The file {1} exceeds the limit',
                'valid_email': 'Enter a valid email address'
            },
        };
    }

    attachEventHandlers() {
        this.form.addEventListener("submit", function (e) {
            e.preventDefault();
        });
        const inputs = this.form.querySelectorAll('[data-vvrules]');
        inputs.forEach((el) => {
            this.isValid = true;
            if (el.getAttribute("type") !== null && el.getAttribute("type") === "file") {
                el.addEventListener("change", () => {
                    this.validateAndUpdate(el);
                });
            } else {
                let typingTimer;
                ['keyup','change'].forEach((evt) => {
                    let multiplier = 1000;
                    if(evt === 'change'){
                        multiplier = 0;
                    }
                    el.addEventListener(evt, () => {
                        clearTimeout(typingTimer);
                        typingTimer = setTimeout(() => {
                            this.validateAndUpdate(el);
                        }, this.typingSeconds * multiplier);
                    });
                });
                el.addEventListener('keydown', function () {
                    clearTimeout(typingTimer);
                });
            }
        });

        this.submitBtn.addEventListener("click", (e) => {
            this.validateAll();
            if(this.submitBtn.style.opacity === "0.65"){
                if(this.enableScroll){
                    const vvi = this.form.querySelector("[data-vvmsg]");
                    if(vvi !== null && vvi.offsetTop > 66){
                        window.scroll({
                            top: vvi.offsetTop-66,
                            left: 0,
                            behavior: 'smooth'
                        });
                    }
                }
            }else if (this.isEnabled && this.handleFormSubmission){
                this.ajax().then((response) => {
                    try {
                        let r = JSON.parse(response);
                        this.processJSONResponse(r);
                    }catch (e) {
                        alert(e);
                        throw new Error(e);
                    }
                }).catch((e) => {
                    alert(e);
                    throw new Error(e);
                });
            }
        });
    }

    validateAndUpdate(el, displayMessages) {
        if(displayMessages === undefined) displayMessages = true;
        this.validateElement(el, displayMessages);
        this.toggleSubmitButton();
    }


    validateAll(displayMessages) {
        if(displayMessages === undefined) displayMessages = true;
        const inputs = this.form.querySelectorAll('[data-vvrules]')
        inputs.forEach((el) => {
            el.dataset.vvid = "1";
            this.validateElement(el, displayMessages);
            this.observe(el);
        });
        this.toggleSubmitButton();
    }

    validateElement(el, displayMessages) {
        this.removeMessage(el);
        if(displayMessages === undefined) displayMessages = true;

        this.isValid = true;
        const nodeName = el.nodeName;
        const rules = el.getAttribute('data-vvrules').split('|');
        let value = nodeName === 'select' ? el.options[el.selectedIndex].value : el.value;
        for (let index in rules) {
            const rule = rules[index].toLowerCase();
            if (rule !== 'permit_empty' && rule !== 'required') {
                /**
                 * If regex is min_length or max_length get parameter and validate
                 **/

                let minRegex = new RegExp(/^min_length/);
                let maxRegex = new RegExp(/^max_length/);
                let maxSizeRegex = new RegExp(/^max_size/);

                let type = '';
                if (rule.match(minRegex))
                    type = 'min';
                else if (rule.match(maxRegex))
                    type = 'max';
                else if (rule.match(maxSizeRegex))
                    type = 'max_size'
                if (type !== '') {
                    let parameterValue = '';
                    try {
                        parameterValue = /[\[]{1,1}.+[\]]$/.exec(rule)[0];
                        parameterValue = parameterValue.substr(1, parameterValue.length-2);
                    } catch (e) {
                        console.log(e);
                        throw new Error(`The ${type}_length's parameter could not be read. Please check you are using the following syntax: ${type}_length[INTEGER_VALUE]`);
                    }
                    if (parameterValue.match(new RegExp(VValidation.rulesPack()['integer'])) || (type === 'max_size' && parameterValue.match(new RegExp(VValidation.rulesPack()['decimal'])))) {

                        if(el.nodeName.toLowerCase() === 'input' && el.getAttribute("type") === 'file'){
                            parameterValue = parseFloat(parameterValue);
                            if(type === 'min'){
                                if(el.files.length < parameterValue){
                                    this.isValid = false;
                                    if (displayMessages) {
                                        this.showMessage(el, (VValidation.errors()[this.lang].min_length_files.replace('{0}', parameterValue)));
                                    }
                                }
                            }else if(type === 'max'){
                                if(el.files.length > parameterValue){
                                    this.isValid = false;
                                    if (displayMessages) {
                                        this.showMessage(el, (VValidation.errors()[this.lang].max_length_files.replace('{0}', parameterValue)));
                                    }
                                }
                            }else {
                                Array.from(el.files).forEach((file) => {
                                    const f_size = file.size /1024 / 1024;
                                    if(f_size > parameterValue){
                                        this.isValid = false;
                                        if (displayMessages) {
                                            this.showMessage(el, (VValidation.errors()[this.lang].max_size.replace('{0}', parameterValue)).replace('{1}',file.name));
                                        }
                                    }
                                });
                            }
                        }else{
                            parameterValue = parseInt(parameterValue);
                            if (type === 'min') {
                                /**
                                 * If permit empty is set, then min_length can be omitted
                                 * */
                                if (value.length < parameterValue && !rules.includes('permit_empty')) {
                                    this.isValid = false;
                                    if (displayMessages) {
                                        this.showMessage(el, (VValidation.errors()[this.lang].min_length.replace('{0}', parameterValue)));
                                    }
                                }
                            } else {
                                if (value.length > parameterValue) {
                                    this.isValid = false;
                                    if (displayMessages) {
                                        this.showMessage(el, VValidation.errors()[this.lang].max_length.replace('{0}', parameterValue));
                                    }
                                }
                            }
                        }

                    } else
                        throw new Error(`${type}_length's parameter must be an integer`);

                } else {
                    /**
                     * The rule is not a length check. Let's try finding the rule in rulesPack object
                     * */
                    if (VValidation.rulesPack().hasOwnProperty(rule)) {
                        /**
                         * rule exists, so we create a new Regex and check if it matches the input value.
                         * If the regex does not match the value we assign isValid to false;
                         * */
                        if (!(new RegExp(VValidation.rulesPack()[rule]).test(value)) && !rules.includes('permit_empty')) {
                            this.isValid = false;
                            if(displayMessages){
                               this.showMessage(el, VValidation.errors()[this.lang][rule]);
                            }
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
                    if(displayMessages){
                        this.showMessage(el, VValidation.errors()[this.lang].required);
                    }
                }

            }
        }
        el.dataset.vvid = (this.isValid) ? "1" : "0";
    }

    /*
    * Checks event
    * */
    toggleSubmitButton() {
        if (this.submitBtn) {
            const inputs = this.form.querySelectorAll('[data-vvrules]');
            let isEnabled = true;
            inputs.forEach((el) => {
                if (el.dataset.vvid === "0") {
                    isEnabled = false;
                }
            });
            if (isEnabled) {
                this.submitBtn.style.opacity = "1";
                this.submitBtn.style.cursor = "";
                this.isEnabled = true;
            } else {
                this.submitBtn.style.opacity = "0.65";
                this.submitBtn.style.cursor = "not-allowed";
                this.isEnabled = false;
            }
        } else {
            throw new Error('Could not find submit button, if you have something different than <input type="submit"> specify your input with data-submit attribute: <button data-submit>Submit</button>');
        }
    }

    /**
     * Observe for changes in attributes and check if they are valid or not
     * */
    observe(el) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-vvid') {
                    /**
                     * data-vvid attribute has changed
                     * To prevent other values different than 0 or 1 and manual manipulations we should make sure the next steps are true
                     * 1. Value is 0 or 1
                     * 2. this.isValid parsed to string (1 or 0) should be equal to data-vvid because that is the validation state of the current element
                     * Step 2 makes sure that the user tries to change data-vvid from false to true
                     * */
                    const val = el.dataset.vvid, isValidString = this.isValid ? "1" : "0";
                    if (val !== "0" && val !== "1" ) {
                        this.validateAndUpdate(el);
                    }
                }
            });
        });
        observer.observe(el, {
            attributes: true //configure it to listen to attribute changes
        });
    }

    showMessage(el, message) {
        this.removeMessage(el);
        const p = document.createElement("p");
        p.innerText = message;
        p.dataset.vvmsg = '';
        p.style.color = '#dc3545';
        p.style.marginBottom = 0;
        p.style.width = "100%";
        el.parentNode.insertBefore(p, el.nextSibling);
    }

    removeMessage(el) {
        const vvi = el.parentNode.querySelector('[data-vvmsg]');
        if(vvi != null) vvi.parentNode.removeChild(vvi);
    }

    ajax(settings){
        return new Promise((resolve, reject) => {
            let ajaxSettings = {
                method: 'post',
                url: this.form.getAttribute("action"),
                data: new FormData(this.form)
            };

            const files = this.form.querySelectorAll("[type='file']");
            files.forEach((element) => {
                if(element.hasAttribute("name") && element.name.length > 0){
                    Array.from(element.files).forEach((file) => {
                        ajaxSettings.data.append(element.name, file);
                    });
                }
            });

            for (let key in settings){
                ajaxSettings[key] = settings[key];
            }
            try{
                let request = new XMLHttpRequest();
                request.onreadystatechange = (r) => {
                    if (r.currentTarget.readyState === 4) {
                        resolve(r.currentTarget.response);
                    }
                }
                request.open(ajaxSettings.method, ajaxSettings.url);
                request.send(ajaxSettings.data);
            }catch (e) {
                alert(e);
                reject(e);
            }
        });
    }

    processJSONResponse(response) {
        for (let k in response) {
            const element = this.form.querySelector(`[name="${k}"]`);

            if (k === 'modal' && response.modal !== null) {
                if(this.modal !== null){
                    const el = this.modal['_element'], body = el.querySelector('.modal-body'), title = el.querySelector('.modal-title');

                    title.innerHTML = response.modal.title;
                    body.innerHTML = '';

                    if(typeof response.modal.body === 'object'){
                        for(let j  in response.modal.body){
                            const p = document.createElement("p");
                            p.innerHTML = isNaN(j) ? `${j}: ${response.modal.body[j]}` : `${response.modal.body[j]}`;
                            body.appendChild(p);
                        }
                    }else{
                        const p = document.createElement('p');
                        p.innerHTML = response.modal.body;
                        body.appendChild(p);
                    }
                    this.modal.show();
                }
            } else if (element !== null) {
                this.showMessage(element, response[k]);
            }
        }
    }
}
