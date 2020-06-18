const patterns = {
    'string': {
        'regex': new RegExp(/^[A-Za-zÀ-ÖØ-öø-ÿ]+$/),
        'error': 'Ingrese sólo caracteres permitidos a-z y sin espacios'
    },
    'username': {
        'regex': new RegExp(/^[A-Za-zÀ-ÖØ-öø-ÿ]+[A-Za-zÀ-ÖØ-öø-ÿ0-9\-_]*$/),
        'error': "Ingrese sólo caracteres de la \"a\" a la \"z\" y opcionalmente añada caracteres del 0 al 9 y/o guiones."
    },
    'string_w_space': {
        'regex': new RegExp(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/),
        'error': 'Ingrese sólo caracteres permitidos a-z'
    },
    'alpha': {
        'regex': new RegExp(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s]+$/),
        'error': "Ingrese sólo caracteres permitidos a-z y 0-9"
    },
    'general': {
        'regex': new RegExp(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s-!¡$\¬\°#@%^&*()_+|~=`{}\[\]:\";'<>¿?,.\/]+$/),
        'error': "Ingrese sólo caracteres permitidos a-z 0-9 y especiales"
    },
    'general_sin_minimo': {
        'regex': new RegExp(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s-!¡$\¬\°#@%^&*()_+|~=`{}\[\]:\";'<>¿?,.\/]*$/),
        'error': "Ingrese sólo caracteres permitidos a-z 0-9 y especiales"
    },
    'general_sin_tags': {
        'regex': new RegExp(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s-!¡$\¬\°#@%^&*()_+|~=`{}\[\]:\";'¿?,.\/]+$/),
        'error': "Ingrese sólo caracteres permitidos a-z 0-9 y especiales a excepción de '<' y '>'"
    },
    'general_sin_tags_ni_minimo': { //sin minimo de longitud
        'regex': new RegExp(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s-!¡$\°@%^&*()_+|~=`{}\[\]:\";'?,.\/]*$/),
        'error': "Ingrese sólo caracteres permitidos a-z 0-9 y especiales a excepción de '<' y '>'"
    },
    'email': {
        'regex': new RegExp(/^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
        'error': 'Ingrese una dirección de correo electrónico valida'
    },
    'int': {
        'regex': new RegExp(/^[0-9]+$/),
        'error': 'Ingrese únicamente valores numéricos enteros.'
    },
    'int_empty': {
        'regex': new RegExp(/^[0-9]*$/),
        'error': 'Ingrese únicamente valores numéricos enteros o deje vacío el valor'
    },
    "float_int": {
        'regex': new RegExp(/^[0-9]+[.]*[0-9]*$/),
        'error': 'Ingrese solo números enteros y decimales'
    },
    "float_int_comma": {
        'regex': new RegExp(/^[0-9]+[0-9,]*[.]*[0-9]*$/),
        'error': 'Ingrese solo números enteros y decimales'
    },
    "float_int_comma_empty": {
        'regex':
            new RegExp(/^[0-9]*[0-9,]*[.]*[0-9]*$/),
        'error':
            'Ingrese solo números enteros y decimales'
    },
    "telephone": {
        'regex':
            new RegExp(/^[+]{0,1}([0-9]+[\s]*[-]{0,1})+$/),
        'error':
            'Ingrese solo números del 0 al 9, y no más de un guión/espacio entre cada número. Ej: 55-12-34-56-78'
    },
    "url": {
        'regex': new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi),
        'error': 'Ingrese una dirección URL valida'
    }
};

class Form {
    constructor(form, settings) {
        this.form = form;
        this.allowedTypes = "image/*";
        this.modal = $("#modal");
        this.valid = true;
        this.base_url = this.form.data("base-url") || "/icon/";
        this.validAmount = 0;
        this.done = null;
        this.url = this.form.attr("action");
        this.fileManagers = {};

        $.each(settings, function (k, v) {
            this[k] = v;
        });

        this.buildFileUploader();

        this.form.on("submit", function (e) {
            e.preventDefault();
        });

        let that = this;
        $.each(this.form.find("select"), (k, v) => {
            $(v).on("change", function () {
                that.closestDiv($(v)).find("[data-remove]").remove();
            });
        });
        this.form.on("validChange", () => {
            if (this.valid) {
                this.enableSendButtons();
            } else {
                this.disableSendButtons();
            }
        });
        this.form.find("[data-textarea]").each(function () {
            const editor = CKEDITOR.replace($(this).attr("id"), {
                on: {
                    change: function () {
                        this.updateElement()
                    }
                }
            });
            editor.config.allowedContent = true;
        });
        this.form.find("[data-pattern]").each((i, v) => {
            this.check();
            const element = $(v);
            const parent = element.parent();

            if (parent.hasClass("input-group")) {
                const newElement = $("<div class='form-form'></div>");
                const newInput = element.clone(true);
                newElement.append(newInput);
                newElement.on("paste", function () {
                    setTimeout(function () {
                        newElement.val(newElement.val().trim());
                    },10);
                });
                element.replaceWith(newElement);
            }else{
                element.on("paste", function () {
                    setTimeout(function () {
                        element.val(element.val().trim());
                    },10);
                });
            }
        });

        this.form.find("[data-required]").each((i, e) => {
            const value = $(e).data("required") || -1;
            $(e).on("change", (evt) => {
                evt.stopPropagation();
                this.checkRequired($(e), true);
                this.form.trigger("validChange");
                this.check();
            });
        });


        this.form.find("[data-min], [data-max]").each((i, v) => {
            const el = $(v);
            $(v).stopTyping(() => {
                this.deleteMessage(el, true);
                let messagesCount = 0;

                if (el.is("[data-min]")) {
                    if (messagesCount === 0) {
                        if (this.checkMin($(v), true)) {
                            messagesCount++;
                        }
                    }
                }
                if (el.is("[data-max]")) {
                    if (messagesCount === 0) {
                        if (this.checkMax($(v), true)) {
                            messagesCount++;
                        }
                    }
                }
                if (el.is("[data-pattern]")) {
                    if (messagesCount === 0) {
                        if (this.checkPattern($(v), true)) {
                            messagesCount++;
                        }
                    }
                }
                if (messagesCount === 0) {
                    el.removeClass("has-danger").addClass("has-success");
                } else {
                    el.addClass("has-danger").removeClass("has-success");
                }
                this.check();
            });
        });
        this.form.find("[data-cancel]").each((i, e) => {
            $(e).on("click", () => {
                this.cancelar();
            });
        });
        this.form.find("[data-submit]").each((i, v) => {
            $(v).on("click", () => {
                if (this.valid) {

                    this.form.append("<div class='form-overlay'><div class='pelota'></div><p>Progreso: <span class='progreso'>0</span>%</p></div>");
                    let progreso = this.form.find(".form-overlay .progreso");
                    let data = new FormData();
                    let that = this;

                    //Append Files
                    $.each(this.fileManagers, (i, v) => {
                        $.each(v, (k, file) => {
                            data.append(`${i}[]`, file, file.name);
                        });
                        let ord = 0;
                        $.each($(`[data-files-selector="${i}"]`).find(".preview"), (a, b) => {
                            data.append(`${i}-orden[]`, `${$(b).data("file-id")},${ord}`);
                            ord++;
                        });
                    });

                    let serialized = this.form.serializeArray();
                    $.each(serialized, function (k, v) {
                        data.append(v.name, v.value);
                    });

                    $.ajax({
                        xhr: function () {
                            let xhr = new window.XMLHttpRequest();
                            xhr.upload.addEventListener("progress", function (evt) {
                                anime({
                                    targets: '.pelota',
                                    translateX: 150,
                                    delay: 300,
                                    endDelay: 400,
                                    direction: 'alternate',
                                    loop: true,
                                    easing: 'easeInOutCirc'
                                });
                                if (evt.lengthComputable) {
                                    let percentComplete = parseInt((evt.loaded / evt.total) * 100);
                                    progreso.text(percentComplete);
                                } else {
                                    progreso.parents("p").html('');
                                }
                            }, false);
                            return xhr;
                        },
                        url: this.url,
                        type: "POST",
                        data: data,
                        cache: false,
                        contentType: false,
                        processData: false
                    }).done((response) => {
                        try {
                            response = JSON.parse(response);
                            if_response(response);
                            if (response.hasOwnProperty("modal")) {
                                this.modal.find(".modal-title").html('Mensaje');
                                this.modal.find(".modal-body").html(response.modal);
                                this.modal.modal('show');
                            }
                            if (response.hasOwnProperty("close_modals")) {
                                $.each(response.close_modals, (i, e) => {
                                    $(e).modal("hide");
                                });
                                if (!response.hasOwnProperty("dont-reset-form")) {
                                    this.cancelar();
                                }
                            }
                            if (response.hasOwnProperty("rebuild-files-selector")) {
                                this.buildFileUploader(response['rebuild-files-selector']);
                            }

                            this.form.find("[data-remove]").remove();

                            if (response.hasOwnProperty("errors")) {
                                $.each(response.errors, (i, v) => {
                                    this.form.find(`[name='${i}']`).after(`<p data-remove class="text-danger">${v}</p>`);
                                });
                            }

                            if (response.hasOwnProperty("success") && response.success) {
                                console.log("Reset the form");
                                this.form[0].reset();
                            }

                        } catch (e) {
                            console.error(e.message);
                        }
                    }).always((response) => {
                        setTimeout(() => {
                            this.form.find(".form-overlay").remove();
                        }, 1000);
                    });

                }
            });
        });
    }

    buildFileUploader(selector) {
        selector = selector || "[data-files-selector]";
        this.form.find(selector).each((i, e) => {
            const el = $(e);
            const sub_container = $("<div></div>");
            new Sortable(sub_container[0], {
                handle: '.preview', // handle's class
                animation: 150,
                filter: 'label',
                fallbackTolerance: 4
            });
            const name = el.data("files-selector");
            const label = $(`<label for="${name}"><img src="${this.base_url}upload.png" alt=""></label>`);
            const input = $(`<input type="file" name="${name}" id="${name}" multiple accept="${this.allowedTypes}">`);
            this.fileManagers[name] = {};
            const close = $(`<span class="close">&times;</span>`);
            const preview = $(`<div class="preview"></div>`);
            preview.append(close);
            el.addClass("form-uploader");
            el.append(input);
            el.append(label);
            el.append(sub_container);

            const li = el.find("ul li");

            if (li !== undefined && li.length > 0) {
                $.each(li, (i, l) => {
                    const p = preview.clone();
                    p.find(".close").one("click", () => {
                        el.after($(`<input type='hidden' name='delete-${name}[]' value="${$(l).data("file-id")}">`));
                        p.remove();
                    });
                    let ff = l.textContent.split(".");
                    ff = ff[ff.length - 1].toLowerCase(); //file format

                    if (ff === 'png' || ff === 'webp' || ff === 'jpeg' || ff === 'jpg' || ff === 'bmp' || ff === 'ico') {
                        p.append($(`<img src="${l.textContent}" alt="${l.textContent}">`));
                    } else {
                        p.append($(`<span class="file-name">${l.textContent}</span>`));
                    }
                    p.attr("data-file-id", $(l).data("file-id"));
                    sub_container.append(p);
                });
            }

            input.on("change", () => {
                $.each(input[0].files, (i, f) => {
                    if (this.fileIsAllowed(f.type) && !this.fileManagers[name].hasOwnProperty(f.name)) {
                        this.fileManagers[name][f.name] = f;
                        const p = preview.clone();

                        if (new RegExp("image/*", "i").test(f.type) && f.type !== 'image/tiff') {
                            p.append($(`<img src="${URL.createObjectURL(f)}" alt="${f.name}">`));
                        } else {
                            p.append($(`<span class="file-name">${f.name}</span>`));
                        }
                        p.attr("data-file-id", f.name);

                        sub_container.append(p);
                        p.find(".close").on("click", () => {
                            p.closest(".form-uploader").siblings("[data-remove]").remove();
                            p.remove();
                            delete this.fileManagers[name][f.name];
                        });
                    }

                });
            });
            input.val("");
        });
    }

    fileIsAllowed(type) {
        const allowed = this.allowedTypes.split(",");
        let isAllowed = false;
        $.each(allowed, (i, e) => {
            if (new RegExp(e, "i").test(type)) {
                isAllowed = true;
            }
        });
        return isAllowed;
    }

    cancelar() {
        this.form[0].reset();
        this.form.find(".form-uploader .close").click();
        this.form.find(".has-success").removeClass("has-success");
        this.form.find(".has-danger").removeClass("has-danger");
        this.form.find("[data-s2]").each(function () {
            $(this).val('').trigger("change");
        });
    }

    check = () => {
        this.valid = true;
        this.form.find("[data-pattern]").each((i, v) => {
            const element = $(v);
            this.checkPattern(element);
        });
        this.form.find("[data-min]").each((i, v) => {
            this.checkMin($(v));
        });
        this.form.find("[data-max]").each((i, v) => {
            this.checkMax($(v));
        });
        this.form.find("[data-required]").each((i, v) => {
            this.checkRequired($(v));
        });
        this.form.trigger("validChange");
    };

    checkRequired(el, showMessage) {
        el.next(".animejs.text-danger.pattern").remove();
        showMessage = showMessage || false;
        let r = el.data("required");
        let v = el.val();
        let invalid = false;
        try {
            invalid = r.toString() === v.toString();
        } catch (e) {
            invalid = false;
        } finally {
            if (invalid) {
                if (showMessage) {
                    setTimeout(() => {
                        el.after("<p class='animejs text-danger w-100 mb-0 pattern'>Seleccione una opción valida</p>");
                        this.showMessage(el);
                    }, 100);
                }
                this.valid = false;
            }
        }
    }

    deleteMessage(el, showMessage) {
        showMessage = showMessage || false;
        if (showMessage) {
            el.next("p").each(function () {
                $(this).remove();
            });
        }
    }

    checkPattern(el, showMessage) {
        showMessage = showMessage || false;
        if (patterns.hasOwnProperty(el.data("pattern"))) {
            if (!el.val().match(patterns[el.data("pattern")].regex)) {
                this.valid = false;
                if (showMessage) {
                    el.after("<p class='animejs text-danger w-100 mb-0 pattern'>" + patterns[el.data("pattern")].error + "</p>");
                    this.showMessage(el);
                    return true;
                }
            }
        } else {
            throw new Error("No se encontró el patrón especificado " + el.data("pattern"));
        }
        return false;
    }

    checkMin(el, showMessage) {
        showMessage = showMessage || false;
        if (el.data("min").toString().match(patterns.int.regex)) {
            if (parseInt(el.val().length) < parseInt(el.data("min"))) {
                this.valid = false;
                if (showMessage) {
                    el.after("<p class='animejs text-danger w-100 mb-0 min'>Ingrese al menos " + el.data("min") + " caracteres.</p>");
                    this.showMessage(el);
                    return true;
                }
            }
        } else {
            throw new Error("El valor mínimo no es valido");
        }
        return false;
    }

    checkMax(el, showMessage) {
        showMessage = showMessage || false;
        if (el.data("max").toString().match(patterns.int.regex)) {
            if (parseInt(el.val().length) > parseInt(el.data("max"))) {
                this.valid = false;
                if (showMessage) {
                    el.after("<p class='animejs text-danger w-100 mb-0 max'>Ingrese máximo " + el.data("max") + " caracteres.</p>");
                    this.showMessage(el);
                    return true;
                }
            }
        } else {
            throw new Error("El valor maximo no es valido");
        }
        return false;
    }

    disableSendButtons() {
        this.form.find("[data-submit]").each(function () {
            $(this).addClass("disabled");
        });
    }

    enableSendButtons() {
        this.form.find("[data-submit]").each(function () {
            $(this).removeClass("disabled");
        });
    }

    showMessage(el) {
        anime({
            targets: el[0].querySelectorAll("p"),
            opacity: 1,
            duration: 800
        });
    }

    closestDiv(e) {
        return e.closest("div:not(.form-form):not(.form-uploader)");
    }

}

$.fn.stopTyping = function (fn, doneTypingInterval) {
    return this.each(function () {
        let typingTimer;
        doneTypingInterval = doneTypingInterval == null ? 280 : doneTypingInterval;
        let $input = $(this);
        $input.on('keyup', function (evt) {
            const key = evt.keyCode || evt.charCode;
            if (key !== 9 && key !== 13) {
                clearTimeout(typingTimer);
                typingTimer = setTimeout(function () {
                    fn($input);
                }, doneTypingInterval);
            }
        });
        $input.on('keydown', function (evt) {
            const key = evt.keyCode || evt.charCode;
            if (key !== 9 && key !== 13) clearTimeout(typingTimer);
        });
    });
};

function if_response(response) {
    if (response.hasOwnProperty("remove")) {
        $.each(response.remove, function (k, v) {
            $(v).each(function () {
                $(this).hide(function () {
                    $(this).remove();
                });
            });
        });
    }
    if (response.hasOwnProperty("update-data")) {
        $.each(response["update-data"], function (k, v) {
            $(`[data-${v.data}]`).attr(v.attr, v.value);
        });
    }
    if (response.hasOwnProperty("replace")) {
        $.each(response.replace, function (k, v) {
            $.each(v, (selector, value) => {
                $(selector).replaceWith(value);
            });
        });
    }
    if (response.hasOwnProperty("prepend")) {
        $.each(response.prepend, function (k, v) {
            $.each(v, (selector, value) => {
                $(selector).prepend(value);
            });
        });
    }
    if (response.hasOwnProperty("append")) {
        $.each(response.append, function (k, v) {
            $.each(v, (selector, value) => {
                $(selector).append(value);
            });
        });
    }
    if (response.hasOwnProperty("html")) {
        $.each(response.html, function (k, v) {
            $(v.selector).each(function () {
                $(this).html(v.value);
            });
        });
    }
    //si el json de respuesta tiene la propidad modal recorrer esta misma para imprimir mensajes modal
    if (response.hasOwnProperty("modal")) {
        //recorrer la propiedad modal
        $.each(response["modal"], function (k, v) {
            /*
            * k = key, v = value
            * v contiene propiedades como modal, body y title que serán asignadas en el modal
            * v.modal debe contener un selector único para el modal, un ejemplo sería #id donde id es el id del modal
            * */
            //Remover backdrop y cerrar modals que podrían estar mostrándose
            $(".modal-backdrop").remove();
            $(v.modal).modal('hide');


            setTimeout(function () {
                $(v.modal).find("[data-accept]").off();
                try {
                    const message = v.body;
                    const mbody = $(v.modal).find(".modal-body");
                    mbody.html('');
                    $.each(message, function (k, v) {
                        mbody.append(`<p>${v}</p>`);
                    });
                } catch (exception) {
                    $(v.modal).find(".modal-body").html(v.body);
                }

                $(v.modal).find(".modal-title").html(v.title);
                $(v.modal).modal('show');
            }, 100);
        });
    }
    if (response.hasOwnProperty("redirect")) {
        if (response.redirect.length === 0) {
            window.location.reload();
        } else {
            window.location.href = response.redirect;
        }
    }
    //Si existe la propiedad redirect-after y también la propiedad hijo: seconds hacer un reload o cambio de location
    if (response.hasOwnProperty("redirect-after") && response["redirect-after"].hasOwnProperty("seconds")) {

        const ra = response["redirect-after"]; //propiedad redirect-after
        const time = ra.seconds * 1000; //tiempo

        //esperar el tiempo
        setTimeout(function () {
            //si existe la propiedad location ir hacia location, de lo contrario sólo hacer un reload de la ubicación actual
            if (ra.hasOwnProperty("location")) {
                window.location.href = ra.location;
            } else {
                window.location.reload();
            }
        }, time)

    }

}

$(document).ready(function () {
    $("[data-form]").each(function () {
        const form = new Form($(this));
    });
    $('[data-s2]').select2();
    $("[data-tag-add]").each(function () {

        const source = $($(this).data("source"));
        const target = $($(this).data("target"));
        let canAdd = true;
        const btn = $(this);
        let added = [];
        btnValidate();

        source.on("change", function () {
            btnValidate();
        });

        btn.on("click", function () {
            if (canAdd) {
                let exists = false;
                const v = source.val();
                added.filter(e => {
                    if (e === v) exists = true;
                });
                if (!exists) {
                    const tag = $(`<div class="tag">${source.find(":selected").text()}</div>`);
                    const rm = $(`<span class="remove">&times;</span>`);
                    const inp = $(`<input type="hidden" name="${source.attr("id")}[]" value="${v}">`);
                    tag.append(inp);
                    tag.append(rm);
                    target.append(tag);
                    added.push(v);
                    rm.on("click", function () {
                        tag.remove();
                        added = added.filter(e => {
                            return e !== v;
                        });
                    });
                }
            }
        });

        function btnValidate() {
            if (source.val() === '' || source.val() === null || source.val() === undefined || source.val().length <= 0) {
                btn.addClass("disabled");
                canAdd = false;
            } else {
                btn.removeClass("disabled")
                canAdd = true;
            }
        }

    });


    let messageModal = $("#message_modal");
    $.each($("[data-delete]"), function () {
        const button = $(this);
        const isInTable = $(this).parents("table").length > 0;
        const id = $(this).data("delete");
        $(this).on("click", function () {
            if ($(this).is("[data-url]")) {
                const url = $(this).data("url");
                messageModal.find(".modal-title").html("Confirmar");
                messageModal.find(".modal-body").html("Si confirma que quiere borrar el vídeo no podrá recuperarlo");
                messageModal.find("[data-accept]").on("click", function () {
                    const accept = $("this");
                    const data = [];
                    data.push({name: 'id', value: id});
                    $.ajax({
                        method: 'post',
                        data: data,
                        url: url,
                        dataType: 'json'
                    }).done(function (response) {
                        $(".modal-backdrop:first-of-type").remove();
                        accept.off();
                        if_response(response);
                        if (isInTable && response.hasOwnProperty("success") && response.success) {
                            button.parents("tr").remove();
                        }
                    });
                });
                messageModal.modal('show');
            }
        });
    });

    $.each($(".modal"), function () {
        $(this).on('show.bs.modal', function (event) {
            let button = $(event.relatedTarget);
            let edit = $(button.data('edit'));

            let modal = $(this);

            $.each(edit.find("[data-target]"), function () {
                if ($(this).is("[data-value]")) {
                    $($(this).data("target")).val($(this).data("value")).trigger("change");
                } else {
                    $($(this).data("target")).val($(this).text());
                }
            });
        });
    });

});