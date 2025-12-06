// Функция, которая отображает сообщение об ошибке под полем
function showInputError(formElement, inputElement, errorMessage, settings) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
  inputElement.classList.add(settings.inputErrorClass);
}

// Функция, которая скрывает сообщение об ошибке
function hideInputError(formElement, inputElement, settings) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  errorElement.textContent = "";
  errorElement.classList.remove(settings.errorClass);
  inputElement.classList.remove(settings.inputErrorClass);
}

// Проверяет валидность поля
function checkInputValidity(formElement, inputElement, settings) {
  const { inputErrorClass, errorClass } = settings;

  // Если поле пустое — ошибка
  if (!inputElement.value.trim()) {
    showInputError(
      formElement,
      inputElement,
      "Поле обязательно для заполнения",
      settings
    );
    return;
  }

  // Проверка длины поля (в зависимости от типа)
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
      message = "Длина должна быть от 2 до 40 символов (или 2–30 для названия)"; // Это будет заменено
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

  // Проверка на разрешённые символы (латиница, кириллица, дефис, пробел)
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

  // Проверка URL
  if (inputElement.classList.contains("popup__input_type_url")) {
    const urlRegex =
      /^(https?:\/\/)?([a-z0-9][a-z0-9\-]*\.[a-z0-9][a-z0-9\-]*)([a-z0-9][a-z0-9\-]*\.[a-z0-9][a-z0-9\-]*)*(:\d{1,5})?(\/[a-z0-9\/]*)*(\?[a-z0-9&=]*)?(#[a-z0-9]*)?$/i;
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

  // Если всё в порядке — убираем ошибку
  hideInputError(formElement, inputElement, settings);
}

// Проверяет, есть ли хотя бы одно невалидное поле
function hasInvalidInput(formElement, settings) {
  const inputElements = formElement.querySelectorAll(settings.inputSelector);
  return Array.from(inputElements).some((input) => !input.validity.valid);
}

// Делает кнопку неактивной
function disableSubmitButton(formElement, settings) {
  const submitButton = formElement.querySelector(settings.submitButtonSelector);
  submitButton.disabled = true;
  submitButton.classList.add(settings.inactiveButtonClass);
}

// Делает кнопку активной
function enableSubmitButton(formElement, settings) {
  const submitButton = formElement.querySelector(settings.submitButtonSelector);
  submitButton.disabled = false;
  submitButton.classList.remove(settings.inactiveButtonClass);
}

// Переключает состояние кнопки в зависимости от валидности
function toggleButtonState(formElement, settings) {
  const isInvalid = hasInvalidInput(formElement, settings);
  if (isInvalid) {
    disableSubmitButton(formElement, settings);
  } else {
    enableSubmitButton(formElement, settings);
  }
}

// Добавляет обработчики событий input для всех полей формы
function setEventListeners(formElement, settings) {
  const inputElements = formElement.querySelectorAll(settings.inputSelector);

  inputElements.forEach((input) => {
    input.addEventListener("input", () => {
      checkInputValidity(formElement, input, settings);
      toggleButtonState(formElement, settings);
    });
  });
}

// Очищает ошибки валидации и делает кнопку неактивной
function clearValidation(formElement, settings) {
  const inputElements = formElement.querySelectorAll(settings.inputSelector);
  inputElements.forEach((input) => {
    hideInputError(formElement, input, settings);
  });
  disableSubmitButton(formElement, settings);
}

// Функция, которая включает валидацию для всех форм
// Принимает объект с настройками
function enableValidation(settings) {
  const formElements = document.querySelectorAll(settings.formSelector);
  formElements.forEach((formElement) => {
    // Сначала очистим старые обработчики, если они есть
    formElement.querySelectorAll(settings.inputSelector).forEach((input) => {
      input.removeEventListener("input", () => {});
    });

    // Добавляем обработчики
    setEventListeners(formElement, settings);
    toggleButtonState(formElement, settings);
  });
}

// Экспорт только нужных функций
export { enableValidation, clearValidation };
