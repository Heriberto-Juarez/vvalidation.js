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
    'alpha': 'Ingrese únicamente caracteres alfabéticos y sin espacio.'
};

const parametersRegex = new RegExp(/(?<=\[).+?(?=\])/);


class HForm {

    constructor(id, settings) {
        this.form = document.getElementById(id);
        this.allowedFileTypes = "image/*";
        this.hasModal = true;
        this.modal = document.getElementById("HFormModal");
        this.valid = true;
        settings = settings || {};
        for (let key in settings) this[key] = settings[key]; //assign settings to HForm object
        this.validate();
    }

    validate() {
        const inputs = this.form.querySelectorAll('[data-hfrules]')

        inputs.forEach((el) => {
            let value = '';
            const nodeName = el.nodeName;

            if (nodeName === 'select')
                value = el.options[el.selectedIndex].value;
            else
                value = el.value;


            const rules = el.getAttribute('data-hfrules').split('|');

            for (let index in rules) {
                const rule = rules[index].toLowerCase();
                if (rule !== 'permit_empty') {

                    /**
                     * If regex is min_length or max_length get parameter and validate
                     **/

                    let minRegex = new RegExp(/^max_length/);
                    let maxRegex = new RegExp(/^min_length/);
                    let type = '';
                    if(rule.match(minRegex))
                        type = 'min';
                    else if (rule.match(maxRegex))
                        type = 'max';

                    if (type !== '') {
                        const parameterValue = parametersRegex.exec(rule)[0];
                        if(parameterValue.match(new RegExp(rulesPack['integer']))){
                            if(type === 'min')
                                if(value.length < parameterValue) this.valid = false;
                                else
                                if(value.length > parameterValue) this.valid = false;
                        }else
                            throw new Error(`${type}_length's parameter must be an integer`);
                    }else {

                        /**
                         * The rule is not a length check. Let's try finding the rule in rulesPack object
                         * */



                    }

                } else if (rule === 'permit_empty' && value.length < 1) {
                    this.valid = true;
                }

            }
        });
    }
}