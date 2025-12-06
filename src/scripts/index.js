import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCard as deleteCardApi,
  changeLikeCardStatus,
} from "./components/api.js";

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

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

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalText = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoModalUsersList = cardInfoModalWindow.querySelector(".popup__list");

const infoDefTemplate = document.getElementById("popup-info-definition-template").content;
const infoUserTemplate = document.getElementById("popup-info-user-preview-template").content;

let currentUserId = null;

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const setButtonLoading = (button, text) => {
  if (!button) return;
  button.dataset.originalText = button.textContent;
  button.textContent = text;
  button.disabled = true;
};

const resetButton = (button) => {
  if (!button) return;
  if (button.dataset.originalText) button.textContent = button.dataset.originalText;
  button.disabled = false;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLike = (cardId, isCurrentlyLiked, likeButton, likeCountEl) => {
  changeLikeCardStatus(cardId, isCurrentlyLiked)
      .then((updatedCard) => {
        likeButton.classList.toggle("card__like-button_is-active");
        likeCountEl.textContent = updatedCard.likes.length;
      })
      .catch((err) => {
        console.log(err);
      });
};

const handleDelete = (cardId, cardElement) => {
    const deleteButton = cardElement.querySelector(
        ".card__control-button_type_delete"
    );

    if (deleteButton) {
        deleteButton.textContent = "Удаление...";
        deleteButton.disabled = true;
    }

    deleteCardApi(cardId)
        .then(() => {
            cardElement.remove();
        })
        .catch((err) => {
            console.log(err);
            if (deleteButton) {
                deleteButton.disabled = false;
                deleteButton.textContent = "";
            }
        });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = profileForm.querySelector(".popup__button");
  setButtonLoading(submitButton, "Сохранение...");
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
        resetButton(submitButton);
      });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = avatarForm.querySelector(".popup__button");
  setButtonLoading(submitButton, "Сохранение...");
  setUserAvatar({ avatar: avatarInput.value })
      .then((userData) => {
        profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
        avatarForm.reset();
        clearValidation(avatarForm, validationSettings);
        closeModalWindow(avatarFormModalWindow);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        resetButton(submitButton);
      });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = cardForm.querySelector(".popup__button");
  setButtonLoading(submitButton, "Создание...");
  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
      .then((newCard) => {
        const cardEl = createCardElement(newCard, {
          currentUserId,
          onPreviewPicture: handlePreviewPicture,
          onLike: handleLike,
          onDelete: handleDelete,
          onInfo: handleInfoClick,
        });
        placesWrap.prepend(cardEl);
        cardForm.reset();
        clearValidation(cardForm, validationSettings);
        closeModalWindow(cardFormModalWindow);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        resetButton(submitButton);
      });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent || "";
  profileDescriptionInput.value = profileDescription.textContent || "";
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);

Promise.all([getCardList(), getUserInfo()])
    .then(([cards, userData]) => {
      currentUserId = userData._id;

      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

      cards.forEach((cardData) => {
        const cardEl = createCardElement(cardData, {
          currentUserId,
          onPreviewPicture: handlePreviewPicture,
          onLike: handleLike,
          onDelete: handleDelete,
          onInfo: handleInfoClick,
        });
        placesWrap.append(cardEl);
      });
    })
    .catch((err) => {
      console.log(err);
    });

const formatDate = (date) =>
    date.toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" });

const createInfoString = (term, description) => {
    const node = infoDefTemplate.cloneNode(true);
    const dt = node.querySelector(".popup__info-term");
    const dd = node.querySelector(".popup__info-description");
    if (dt) dt.textContent = term;
    if (dd) dd.textContent = description;
    return node;
};

const createUserPreview = (user) => {
    const node = infoUserTemplate.cloneNode(true);
    const li = node.querySelector(".popup__list-item");
    if (li) {
        li.textContent = user.name || "Без имени";
    }
    return node;
};

const handleInfoClick = (cardId) => {
    getCardList()
        .then((cards) => {
            const cardData = cards.find((c) => c._id === cardId);
            if (!cardData) {
                throw new Error("Карточка не найдена");
            }

            cardInfoModalTitle.textContent = "";
            cardInfoModalInfoList.innerHTML = "";
            cardInfoModalText.textContent = "";
            cardInfoModalUsersList.innerHTML = "";

            cardInfoModalTitle.textContent = cardData.name;

            cardInfoModalInfoList.append(createInfoString("Автор:", cardData.owner?.name || "—"));
            cardInfoModalInfoList.append(createInfoString("О себе:", cardData.owner?.about || "—"));
            if (cardData.createdAt) {
                cardInfoModalInfoList.append(createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt))));
            }

            if (Array.isArray(cardData.likes) && cardData.likes.length) {
                cardInfoModalText.textContent = "Лайкнули:";
                cardData.likes.forEach((u) => {
                    cardInfoModalUsersList.append(createUserPreview(u));
                });
            } else {
                cardInfoModalText.textContent = "Никто не лайкнул карточку";
            }

            openModalWindow(cardInfoModalWindow);
        })
        .catch((err) => {
            console.log(err);
        });
};

