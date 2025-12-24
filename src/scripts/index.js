import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addNewCard,
  deleteCard as apiDeleteCard,
  likeCard as apiLikeCard,
  unlikeCard as apiUnlikeCard,
} from "./components/api.js";

// DOM-элементы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

// ID пользователя для проверки авторства карточек
let currentUser_id = null;

// Функции обработчиков событий
const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

// Обновление данных профиля
const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  // Сохраняем текст кнопки и меняем на "Сохранение..."
  const submitButton = profileForm.querySelector(".popup__button");
  const originalText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";
  submitButton.disabled = true;

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      // Восстанавливаем кнопку
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

// Обновление аватара
const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();

  // Сохраняем текст кнопки и меняем на "Сохранение..."
  const submitButton = avatarForm.querySelector(".popup__button");
  const originalText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";
  submitButton.disabled = true;

  setUserAvatar({
    avatar: avatarInput.value,
  })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      // Восстанавливаем кнопку
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

// Добавление новой карточки
const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  // Сохраняем текст кнопки и меняем на "Создание..."
  const submitButton = cardForm.querySelector(".popup__button");
  const originalText = submitButton.textContent;
  submitButton.textContent = "Создание...";
  submitButton.disabled = true;

  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCard) => {
      placesWrap.prepend(
        createCardElement(
          newCard,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: (likeButton) => handleLike(likeButton, newCard._id),
            onDeleteCard: (cardElement) =>
              handleDelete(cardElement, newCard._id),
          },
          currentUser_id // передаем ID пользователя для проверки авторства
        )
      );
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      // Восстанавливаем кнопку
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

// Обработчик лайка
const handleLike = (likeButton, cardId) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  if (isLiked) {
    apiUnlikeCard(cardId)
      .then((updatedCard) => {
        // Обновляем количество лайков на странице
        const likeCountElement =
          likeButton.parentElement.querySelector(".card__like-count");
        if (likeCountElement) {
          likeCountElement.textContent = updatedCard.likes.length;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    apiLikeCard(cardId)
      .then((updatedCard) => {
        // Обновляем количество лайков на странице
        const likeCountElement =
          likeButton.parentElement.querySelector(".card__like-count");
        if (likeCountElement) {
          likeCountElement.textContent = updatedCard.likes.length;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  likeCard(likeButton);
};

// Обработчик удаления карточки
const handleDelete = (cardElement, cardId) => {
  // Показываем модальное окно подтверждения удаления
  const confirmDeleteModal = document.querySelector(".popup_type_remove-card");
  if (confirmDeleteModal) {
    // Открываем модальное окно подтверждения
    openModalWindow(confirmDeleteModal);

    // Обработчик подтверждения удаления
    const confirmButton = confirmDeleteModal.querySelector(".popup__button");
    confirmButton.addEventListener("click", () => {
      apiDeleteCard(cardId)
        .then(() => {
          deleteCard(cardElement);
          closeModalWindow(confirmDeleteModal);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  } else {
    // Если модальное окно не найдено, удаляем напрямую
    apiDeleteCard(cardId)
      .then(() => {
        deleteCard(cardElement);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

// Обработчик открытия формы профиля
openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

// Обработчик открытия формы аватара
profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

// Обработчик открытия формы добавления карточки
openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

// Инициализация приложения
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    // Сохраняем ID пользователя для проверки авторства карточек
    currentUser_id = userData._id;

    // Обновляем данные профиля
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    // Добавляем карточки на страницу
    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(
          cardData,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: (likeButton) => handleLike(likeButton, cardData._id),
            onDeleteCard: (cardElement) =>
              handleDelete(cardElement, cardData._id),
          },
          currentUser_id // передаем ID пользователя для проверки авторства
        )
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });

// Установка обработчиков закрытия модальных окон
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Настройки валидации
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);
