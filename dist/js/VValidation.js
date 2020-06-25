"use strict";module.exports = class VValidation{constructor(e,t){this.form=document.getElementById(e),this.submitBtn=this.form.querySelector("[type='submit']"),null===this.submitBtn&&(this.submitBtn=this.form.querySelector("[data-submit]"));try{this.modal=new bootstrap.Modal(document.getElementById("VVModal"))}catch(e){this.modal=null}this.isValid=!0,this.lang="en",this.handleFormSubmission=!0,this.typingSeconds=.5,this.enableScroll=!0,t=t||{};for(let e in t)this[e]=t[e];this.validateAll(!1),this.attachEventHandlers()}static rulesPack(){return{alpha:/^[a-zA-Z]+$/,alpha_space:/^[a-zA-Z\s]+$/,alpha_dash:/^[a-zA-Z_]+$/,alpha_numeric:/^[a-zA-Z0-9]+$/,alpha_numeric_space:/^[a-zA-Z0-9\s]+$/,alpha_numeric_punct:/^[a-zA-Z0-9\~\!\#\$\%\&\*\-\_\+\=\|\:\.]+$/,decimal:/^[-+]?\d+(?:[,.]\d+)*$/,hexadecimal:/^[0-9a-fA-F]+$/,integer:/^[0-9]+$/,valid_email:/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/}}static errors(){return{es:{alpha:"Ingrese únicamente valores alfabéticos",alpha_space:"Ingrese únicamente valores alfabéticos y espacios",alpha_dash:"Ingrese únicamente valores alfabéticos y guiones",alpha_numeric:"Ingrese únicamente valores alfabéticos y numéricos",alpha_numeric_space:"Ingrese únicamente valores alfabéticos, numéricos y espacios",alpha_numeric_punct:"Ingrese únicamente valores alfabéticos, numéricos y los siguientes signos de puntuación: ~ ! # $ % & * - _ + = | : .",decimal:"Ingrese únicamente valores decimales",hexadecimal:"Ingrese únicamente valores hexadecimales",integer:"Ingrese únicamente valores enteros",min_length:"Ingrese al menos {0} caracteres",max_length:"Ingrese como máximo {0} caracteres",required:"Este campo es requerido",min_length_files:"Seleccione al menos {0} archivos",max_length_files:"Seleccione máximo {0} archivos",max_size:"Cada archivo debe pesar como máximo {0} Mb. El archivo {1} supera el límite.",valid_email:"Ingrese una dirección de correo electrónico valida"},en:{alpha:"Enter alphabetic values only",alpha_space:"Enter alphabetic values and spaces only",alpha_dash:"Enter alphabetic values and dashes only",alpha_numeric:"Enter alphabetic and numeric values only",alpha_numeric_space:"Enter alphabetic, numeric, and spaces values only",alpha_numeric_punct:"Enter alphabetic and numeric values, and the following symbols: ~ ! # $ % & * - _ + = | : . only",decimal:"Enter decimal values only",hexadecimal:"Enter hexadecimal values only",integer:"Enter integer values only",min_length:"Enter at least {0} characters",max_length:"Enter maximum {0} characters",required:"This field is required",min_length_files:"Select at least {0} files",max_length_files:"Select maximum {0} files",max_size:"Each file must weigh maximum {0} Mb. The file {1} exceeds the limit",valid_email:"Enter a valid email address"}}}attachEventHandlers(){this.form.addEventListener("submit",(function(e){e.preventDefault()}));this.form.querySelectorAll("[data-vvrules]").forEach(e=>{if(this.isValid=!0,null!==e.getAttribute("type")&&"file"===e.getAttribute("type"))e.addEventListener("change",()=>{this.validateAndUpdate(e)});else{let t;["keyup","change"].forEach(a=>{let i=1e3;"change"===a&&(i=0),e.addEventListener(a,()=>{clearTimeout(t),t=setTimeout(()=>{this.validateAndUpdate(e)},this.typingSeconds*i)})}),e.addEventListener("keydown",(function(){clearTimeout(t)}))}}),this.submitBtn.addEventListener("click",e=>{if(this.validateAll(),"0.65"===this.submitBtn.style.opacity){if(this.enableScroll){const e=this.form.querySelector("[data-vvmsg]");null!==e&&e.offsetTop>66&&window.scroll({top:e.offsetTop-66,left:0,behavior:"smooth"})}}else this.isEnabled&&this.handleFormSubmission&&this.ajax().then(e=>{try{let t=JSON.parse(e);this.processJSONResponse(t)}catch(e){throw alert(e),new Error(e)}}).catch(e=>{throw alert(e),new Error(e)})})}validateAndUpdate(e,t){void 0===t&&(t=!0),this.validateElement(e,t),this.toggleSubmitButton()}validateAll(e){void 0===e&&(e=!0);this.form.querySelectorAll("[data-vvrules]").forEach(t=>{t.dataset.vvid="1",this.validateElement(t,e),this.observe(t)}),this.toggleSubmitButton()}validateElement(e,t){this.removeMessage(e),void 0===t&&(t=!0),this.isValid=!0;const a=e.nodeName,i=e.getAttribute("data-vvrules").split("|");let s="select"===a?e.options[e.selectedIndex].value:e.value;for(let a in i){const l=i[a].toLowerCase();if("permit_empty"!==l&&"required"!==l){let a=new RegExp(/^min_length/),n=new RegExp(/^max_length/),r=new RegExp(/^max_size/),o="";if(l.match(a)?o="min":l.match(n)?o="max":l.match(r)&&(o="max_size"),""!==o){let a="";try{a=/[\[]{1,1}.+[\]]$/.exec(l)[0],a=a.substr(1,a.length-2)}catch(e){throw console.log(e),new Error(`The ${o}_length's parameter could not be read. Please check you are using the following syntax: ${o}_length[INTEGER_VALUE]`)}if(!(a.match(new RegExp(VValidation.rulesPack().integer))||"max_size"===o&&a.match(new RegExp(VValidation.rulesPack().decimal))))throw new Error(o+"_length's parameter must be an integer");"input"===e.nodeName.toLowerCase()&&"file"===e.getAttribute("type")?(a=parseFloat(a),"min"===o?e.files.length<a&&(this.isValid=!1,t&&this.showMessage(e,VValidation.errors()[this.lang].min_length_files.replace("{0}",a))):"max"===o?e.files.length>a&&(this.isValid=!1,t&&this.showMessage(e,VValidation.errors()[this.lang].max_length_files.replace("{0}",a))):Array.from(e.files).forEach(i=>{i.size/1024/1024>a&&(this.isValid=!1,t&&this.showMessage(e,VValidation.errors()[this.lang].max_size.replace("{0}",a).replace("{1}",i.name)))})):(a=parseInt(a),"min"===o?s.length<a&&!i.includes("permit_empty")&&(this.isValid=!1,t&&this.showMessage(e,VValidation.errors()[this.lang].min_length.replace("{0}",a))):s.length>a&&(this.isValid=!1,t&&this.showMessage(e,VValidation.errors()[this.lang].max_length.replace("{0}",a))))}else VValidation.rulesPack().hasOwnProperty(l)&&(new RegExp(VValidation.rulesPack()[l]).test(s)||i.includes("permit_empty")||(this.isValid=!1,t&&this.showMessage(e,VValidation.errors()[this.lang][l])))}else"permit_empty"===l&&s.length<1?this.isValid=!0:"required"===l&&("file"===e.getAttribute("type")&&e.files.length<1||s.length<1)&&(this.isValid=!1,t&&this.showMessage(e,VValidation.errors()[this.lang].required))}e.dataset.vvid=this.isValid?"1":"0"}toggleSubmitButton(){if(!this.submitBtn)throw new Error('Could not find submit button, if you have something different than <input type="submit"> specify your input with data-submit attribute: <button data-submit>Submit</button>');{const e=this.form.querySelectorAll("[data-vvrules]");let t=!0;e.forEach(e=>{"0"===e.dataset.vvid&&(t=!1)}),t?(this.submitBtn.style.opacity="1",this.submitBtn.style.cursor="",this.isEnabled=!0):(this.submitBtn.style.opacity="0.65",this.submitBtn.style.cursor="not-allowed",this.isEnabled=!1)}}observe(e){new MutationObserver(t=>{t.forEach(t=>{if("data-vvid"===t.attributeName){const t=e.dataset.vvid;this.isValid;"0"!==t&&"1"!==t&&this.validateAndUpdate(e)}})}).observe(e,{attributes:!0})}showMessage(e,t){this.removeMessage(e);const a=document.createElement("p");a.innerText=t,a.dataset.vvmsg="",a.style.color="#dc3545",a.style.marginBottom=0,a.style.width="100%",e.parentNode.insertBefore(a,e.nextSibling)}removeMessage(e){const t=e.parentNode.querySelector("[data-vvmsg]");null!=t&&t.parentNode.removeChild(t)}ajax(e){return new Promise((t,a)=>{let i={method:"post",url:this.form.getAttribute("action"),data:new FormData(this.form)};this.form.querySelectorAll("[type='file']").forEach(e=>{e.hasAttribute("name")&&e.name.length>0&&Array.from(e.files).forEach(t=>{i.data.append(e.name,t)})});for(let t in e)i[t]=e[t];try{let e=new XMLHttpRequest;e.onreadystatechange=e=>{4===e.currentTarget.readyState&&t(e.currentTarget.response)},e.open(i.method,i.url),e.send(i.data)}catch(e){alert(e),a(e)}})}processJSONResponse(e){for(let t in e){const a=this.form.querySelector(`[name="${t}"]`);if("modal"===t&&null!==e.modal){if(null!==this.modal){const t=this.modal._element,a=t.querySelector(".modal-body");if(t.querySelector(".modal-title").innerHTML=e.modal.title,a.innerHTML="","object"==typeof e.modal.body)for(let t in e.modal.body){const i=document.createElement("p");i.innerHTML=isNaN(t)?`${t}: ${e.modal.body[t]}`:""+e.modal.body[t],a.appendChild(i)}else{const t=document.createElement("p");t.innerHTML=e.modal.body,a.appendChild(t)}this.modal.show()}}else null!==a&&this.showMessage(a,e[t])}}}