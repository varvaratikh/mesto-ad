const getTemplate = () => {
  return document
      .getElementById("card-template")
      .content.querySelector(".card")
      .cloneNode(true);
};

export const createCardElement = (
    data,
    { currentUserId, onPreviewPicture, onLike, onDelete, onInfo }
) => {
  const cardElement = getTemplate();

  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCountEl = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  const cardImage = cardElement.querySelector(".card__image");
  const title = cardElement.querySelector(".card__title");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  title.textContent = data.name;
  likeCountEl.textContent = data.likes.length;

  if (Array.isArray(data.likes) && data.likes.some((u) => u._id === currentUserId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (!data.owner || data.owner._id !== currentUserId) {
    deleteButton.remove();
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));
  }

  if (onLike) {
    likeButton.addEventListener("click", () =>
        onLike(data._id, likeButton.classList.contains("card__like-button_is-active"), likeButton, likeCountEl)
    );
  }

  if (onDelete && deleteButton) {
    deleteButton.addEventListener("click", () => onDelete(data._id, cardElement));
  }

  if (onInfo && infoButton) {
    infoButton.addEventListener("click", () => onInfo(data._id));
  }

  return cardElement;
};