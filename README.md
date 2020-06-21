# VValidation.js
This is a vanilla javascript validation library by Heriberto Juárez. Created with the purpose of making 
people's life's better (mine too), while avoiding the use of heavy libraries that have a lot of 
dependencies, or that are not giving you the experience you want or need.

![image](https://user-images.githubusercontent.com/20604217/85223218-dd6b2e80-b386-11ea-9ea0-6a6f7fdacf94.png)


## Features:
* File validation
* Inputs validation (input, textarea,...)
* Languages support (English and Spanish supported)
* Lightweight (Currently 7.9 KB)
* Easy to implement
* Compatible with bootstrap 5
* Show modals if available
* Make Requests Out of the box (When a form is valid, it is sent to server using ajax)
* Validate as you type (Don't wait until the user hits the submit button to validate the fields)   
   
## Install

##### Github:
Clone or download the repository

`git clone https://github.com/Heriberto-Juarez/vvalidation.js
`
#### npm

`npm i vvalidation.js`

Currently, the only way to run use the library is by using a script tag. (I plan to add node's **require** support in the future.)

`<script src="path/to/VValidation.min.js"></script>`

## How to use:

### JS
To validate a form you need to create a new instance of the VValidation
object. 


    new VValidation('myFormID', {});
    
The first argument is the ID of the form you want to validate, and the second
argument is an object with the settings you want. 

And that's it!

**Important Note:** Make sure your form has a submit button and all your fields have 
a name.


### HTML

An example of a form is the following:

            <form class="mb-5" id="myFormID" action="/path/to/server/script">
                <div class="form-group mb-3">
                    <label for="exampleFormControlInput1">Email address</label>
                    <input type="email" class="form-control" name="email" placeholder="name@example.com" data-vvrules="valid_email|required">
                </div>
                <div class="form-group mb-3">
                    <input type="file" name="" multiple data-vvrules="min_length[1]">
                </div>
                <div class="input-group input-group-sm mb-3">
                    <div class="input-group-prepend">
                        <span class="input-group-text" id="inputGroup-sizing-sm">Small</span>
                    </div>
                    <input type="text" class="form-control" aria-label="Sizing example input" data-vvrules="required" name="example">
                </div>
                <div class="form-group mb-3">
                    <input type="submit" class="btn btn-primary" value="submit" data-submit>
                </div>
            </form>
            
            
## How to specify the validation you need:

As you may have noticed in the markup shown previously, inputs have an attribute:
`data-vvrules` that contains rules like **required, valid_email, etc**

The following table contains the currently available validation rules (More of them will be added later):

**Note:** Rules must be separated by a pipe | (vertical line) as here: `data-vvrules="ruleOne|ruleTwo|ruleN"`

|Rule|Description|
|---|---|
|min_length[_**N**_]|The element must have a minimum length of _**N**_ where N is an integer. Applies to strings and file inputs
|max_length[_**N**_]|The element must have a maximum length of _**N**_ where N is an integer. Applies to strings and file inputs
|max_size[_**MB**_]| The element must have maximum size of _**B**_ MB where MB is an integer. Applies to file inputs
|required|The element must have a value (Applies to strings and file inputs)|
|permit_empty| The element can be empty
|integer| The input must contain an integer
|decimal| The input must contain a decimal number
|alpha| Must contain alphabetic characters only
|alpha_space| Must contain alphabetic characters and spaces only
|alpha_dash| Must contain alphabetic characters and dashes only
|alpha_numeric| Must contain alphanumeric characters only
|alpha_numeric_space| Must contain alphanumeric characters and spaces only
|alpha_numeric_punct| Must contain alphanumeric and punctuation `~ ! # $ % & * - _ + = \/ : .` characters only
|hexadecimal| Must contain hexadecimal characters only
|valid_email| Must contain a valid email


## Settings

There are some interesting settings you can play with. 
Every time you create an instance of the VValidation class you can pass an object with settings. 
Here you have an example where the language of the validation messages is changed to spanish:

    let hform = new VValidation('myForm', {
        'lang': 'es'
    });

A full list of the settings available is found here:

|Name|Description|Possible Values|Default|
|---|---|---|---|
|`lang`| Language of the validation messsages|`es, en`|`en`
|`submitBtn`| Language of the validation messsages|node|`this.form.querySelector("[type='submit']")`
|`modal`| Bootstrap's 5 modal instance|Instance of bootstrap's 5 modal|`new bootstrap.Modal(document.getElementById("VVModal"));`
|`handleFormSubmission`|Tells the script weather if it must send the data to the server once validated|`true`, `false`|`true`
|`typingSeconds`|When user stopped typing for **x** `typingSeconds` the field is validated|decimal or integer value|`0.50`
|`enableScroll`|If true when an error is not visible we scroll to it|`true`, `false`|`true`


## Cool server side responses
If you don't disable the form submission, this library will make a post request to the action attribute of
the form and submit all the data (including files) using ajax.

If you decided to go with our ajax call you should know the following things.

**1. Server must return a json:**

Json is a very powerful datatype, and I rely on that. But don't worry, you will see why I did this.

**2. You can return a response that will be added after a field:**

Imagine you have successfully validated a login form, but the password the user entered is invalid,
of course you want to be able to tell the user what's happening.
Well, there is good news: You can return a json like the one below to show messages:

`{
    'u_password': 'The password you entered is invalid'
}`

**Note:** `u_password` is the `name` of an input: `<input type="password" name="u_password"/>`

Every response coming from the server, is analyzed in search of an input that have the same **name** as any of the **keys** of the json response.
If any is found, then the value of the json item will be added after the input that was found.

In the example we saw previously, we can see the `u_password` **key** of the **response** matches 
the input **name** which is `u_password`. In that case `The password you entered is invalid` string will be added after
the input.

**2. You can use bootstrap 5 modals:**

![image](https://user-images.githubusercontent.com/20604217/85223260-51a5d200-b387-11ea-9036-29ad8bde264e.png)
   
This is totally optional, and I've added this because bootstrap is world widely used and
because I use it a lot, but as I said, this is totally optional. 

To enable the use of the modal you must add the modal's HTML to the same
page where you have your form. 

**Important:** The modal should have an **ID**  **VVModal**

    <div class="modal fade" id="VVModal" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel"></h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" data-dismiss="modal">Accept</button>
                </div>
            </div>
        </div>
    </div>
    
The next step is to make use of our powerful json and in the server return something like this:
`{
    'modal': {
        'title': 'Success!',
        'body': 'Congratulations, your have logged in successfully. You are being redirected...'
    }
}
`

Now every time you will be able to not only return messages that are added after inputs but also 
you will be able to display messages in bootstrap 5 modals.
