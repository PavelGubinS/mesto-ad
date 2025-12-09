function showInputError(formElement, inputElement, errorMessage, settings) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
  inputElement.classList.add(settings.inputErrorClass);
}

function hideInputError(formElement, inputElement, settings) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  errorElement.textContent = "";
  errorElement.classList.remove(settings.errorClass);
  inputElement.classList.remove(settings.inputErrorClass);
}

function checkInputValidity(formElement, inputElement, settings) {
  const { inputErrorClass, errorClass } = settings;

  if (!inputElement.value.trim()) {
    showInputError(
      formElement,
      inputElement,
      "Поле обязательно для заполнения",
      settings
    );
    return;
  }

  const minLength =
    inputElement.classList.contains("popup__input_type_name") ||
    inputElement.classList.contains("popup__input_type_card-name")
      ? 2
      : 2;

  const maxLength = inputElement.classList.contains("popup__input_type_name")
    ? 40
    : inputElement.classList.contains("popup__input_type_card-name")
    ? 30
    : inputElement.classList.contains("popup__input_type_description")
    ? 200
    : Infinity;

  if (
    inputElement.value.length < minLength ||
    inputElement.value.length > maxLength
  ) {
    let message = "";
    if (
      inputElement.classList.contains("popup__input_type_name") ||
      inputElement.classList.contains("popup__input_type_card-name")
    ) {
      message = "Длина должна быть от 2 до 40 символов (или 2–30 для названия)";
    } else if (
      inputElement.classList.contains("popup__input_type_description")
    ) {
      message = "Длина должна быть от 2 до 200 символов";
    } else if (inputElement.classList.contains("popup__input_type_url")) {
      message = "Введите корректную ссылку";
    }
    showInputError(formElement, inputElement, message, settings);
    return;
  }

  if (
    inputElement.classList.contains("popup__input_type_name") ||
    inputElement.classList.contains("popup__input_type_card-name")
  ) {
    const regex = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
    if (!regex.test(inputElement.value)) {
      const customMessage =
        inputElement.dataset.errorMessage ||
        "Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы";
      showInputError(formElement, inputElement, customMessage, settings);
      return;
    }
  }

  if (inputElement.classList.contains("popup__input_type_url")) {
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i;
    if (!urlRegex.test(inputElement.value)) {
      showInputError(
        formElement,
        inputElement,
        "Введите корректную ссылку",
        settings
      );
      return;
    }
  }

  hideInputError(formElement, inputElement, settings);
}

function hasInvalidInput(formElement, settings) {
  const inputElements = formElement.querySelectorAll(settings.inputSelector);
  return Array.from(inputElements).some((input) => !input.validity.valid);
}

function disableSubmitButton(formElement, settings) {
  const submitButton = formElement.querySelector(settings.submitButtonSelector);
  submitButton.disabled = true;
  submitButton.classList.add(settings.inactiveButtonClass);
}

function enableSubmitButton(formElement, settings) {
  const submitButton = formElement.querySelector(settings.submitButtonSelector);
  submitButton.disabled = false;
  submitButton.classList.remove(settings.inactiveButtonClass);
}

function toggleButtonState(formElement, settings) {
  const isInvalid = hasInvalidInput(formElement, settings);
  if (isInvalid) {
    disableSubmitButton(formElement, settings);
  } else {
    enableSubmitButton(formElement, settings);
  }
}

function setEventListeners(formElement, settings) {
  const inputElements = formElement.querySelectorAll(settings.inputSelector);

  inputElements.forEach((input) => {
    input.addEventListener("input", () => {
      checkInputValidity(formElement, input, settings);
      toggleButtonState(formElement, settings);
    });
  });
}

function clearValidation(formElement, settings) {
  const inputElements = formElement.querySelectorAll(settings.inputSelector);
  inputElements.forEach((input) => {
    hideInputError(formElement, input, settings);
  });
  disableSubmitButton(formElement, settings);
}

function enableValidation(settings) {
  const formElements = document.querySelectorAll(settings.formSelector);
  formElements.forEach((formElement) => {
    formElement.querySelectorAll(settings.inputSelector).forEach((input) => {
      input.removeEventListener("input", () => {});
    });

    setEventListeners(formElement, settings);
    toggleButtonState(formElement, settings);
  });
}

export { enableValidation, clearValidation };
