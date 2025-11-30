const showInputError = (formElement, inputElement, errorMessage, settings) => {
    const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
    inputElement.classList.add(settings.inputErrorClass);
    if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.classList.add(settings.errorClass);
    }
};

const hideInputError = (formElement, inputElement, settings) => {
    const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
    inputElement.classList.remove(settings.inputErrorClass);
    if (errorElement) {
        errorElement.textContent = "";
        errorElement.classList.remove(settings.errorClass);
    }
};

const checkInputValidity = (formElement, inputElement, settings) => {
    const pattern = inputElement.dataset.pattern;

    if (pattern) {
        const regex = new RegExp(pattern);
        if (inputElement.value && !regex.test(inputElement.value)) {
            const customMessage = inputElement.dataset.errorMessage || "Неверный формат";
            showInputError(formElement, inputElement, customMessage, settings);
            return;
        }
    }

    if (!inputElement.validity.valid) {
        showInputError(formElement, inputElement, inputElement.validationMessage, settings);
    } else {
        hideInputError(formElement, inputElement, settings);
    }
};

const hasInvalidInput = (inputList) => {
    return Array.from(inputList).some((inputEl) => !inputEl.validity.valid);
};

const disableSubmitButton = (buttonElement, settings) => {
    buttonElement.classList.add(settings.inactiveButtonClass);
    buttonElement.disabled = true;
};

const enableSubmitButton = (buttonElement, settings) => {
    buttonElement.classList.remove(settings.inactiveButtonClass);
    buttonElement.disabled = false;
};

const toggleButtonState = (inputList, buttonElement, settings) => {
    if (!buttonElement) return;
    if (hasInvalidInput(inputList)) {
        disableSubmitButton(buttonElement, settings);
    } else {
        enableSubmitButton(buttonElement, settings);
    }
};

const setEventListeners = (formElement, settings) => {
    const inputList = formElement.querySelectorAll(settings.inputSelector);
    const buttonElement = formElement.querySelector(settings.submitButtonSelector);

    toggleButtonState(inputList, buttonElement, settings);

    inputList.forEach((inputElement) => {
        inputElement.addEventListener("input", () => {
            checkInputValidity(formElement, inputElement, settings);
            toggleButtonState(inputList, buttonElement, settings);
        });
    });
};

export const clearValidation = (formElement, settings) => {
    if (!formElement) return;
    const inputList = formElement.querySelectorAll(settings.inputSelector);
    const buttonElement = formElement.querySelector(settings.submitButtonSelector);

    inputList.forEach((inputElement) => {
        hideInputError(formElement, inputElement, settings);
    });

    if (buttonElement) disableSubmitButton(buttonElement, settings);
};

export const enableValidation = (settings) => {
    if (!settings || typeof settings !== "object") return;
    const formList = document.querySelectorAll(settings.formSelector);

    formList.forEach((formElement) => {
        setEventListeners(formElement, settings);
    });
};
