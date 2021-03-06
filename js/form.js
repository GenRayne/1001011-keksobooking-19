'use strict';

(function () {
  // --------------------- Импорт ---------------------

  var Key = window.util.Key;
  var InvalidText = window.util.InvalidText;
  var houseTypeToMinPrice = window.util.houseTypeToMinPrice;
  var RoomsQuantity = window.util.RoomsQuantity;
  var GuestsNumber = window.util.GuestsNumber;
  var GuestsOption = window.util.GuestsOption;

  var adForm = window.util.adForm;
  var adFormCapacity = window.util.adFormCapacity;

  var notify = window.notification.notify;
  var successBlock = window.notification.successBlock;

  var map = window.pins.map;
  var mainPin = window.pins.main;
  var clearMap = window.pins.clearMap;
  var renderPins = window.pins.render;

  var MainPin = window.dragAndDrop.MainPin;
  var adFormAddress = window.dragAndDrop.adFormAddress;

  var filterForm = window.filter.form;
  var filterFormInputs = window.filter.inputs;
  var onRequestError = window.filter.onRequestError;

  var adFormAvatar = window.previews.adFormAvatar;
  var adFormPhotos = window.previews.adFormPhotos;
  var imageRegExp = window.previews.imageRegExp;
  var resetAvatar = window.previews.resetAvatar;
  var resetPhotos = window.previews.resetPhotos;

  // ---------------- Переменные модуля ----------------

  var CenterPinCoord = {
    X: mainPin.offsetLeft + MainPin.ROUND_SIDE / 2,
    Y: mainPin.offsetTop + MainPin.ROUND_SIDE / 2
  };

  var adFormAvatarLabel = adForm.querySelector('.ad-form-header__drop-zone');
  var adFormTitle = adForm.querySelector('#title');
  var adFormType = adForm.querySelector('#type');
  var adFormPrice = adForm.querySelector('#price');
  var adFormTimein = adForm.querySelector('#timein');
  var adFormTimeout = adForm.querySelector('#timeout');
  var adFormRooms = adForm.querySelector('#room_number');
  var adFormFeatures = adForm.querySelector('.features');
  var adFormDescription = adForm.querySelector('#description');
  var adFormPhotosLabel = adForm.querySelector('.ad-form__drop-zone');
  var adFormResetBtn = adForm.querySelector('.ad-form__reset');
  var adFormSubmitBtn = adForm.querySelector('.ad-form__submit');

  var invalidPriceMessageBox = adForm.querySelector('#price + p');
  var invalidTitleMessageBox = adForm.querySelector('#title + p');

  var adFormInputs = [
    adFormAvatar,
    adFormTitle,
    adFormAddress,
    adFormType,
    adFormPrice,
    adFormTimein,
    adFormTimeout,
    adFormRooms,
    adFormCapacity,
    adFormFeatures,
    adFormDescription,
    adFormPhotos,
    adFormSubmitBtn,
    adFormResetBtn
  ];

  var ErrorText = {
    ROOMS: 'Неверное количество комнат.'
  };

  // ============== Активация карты и работа с формами ==============

  var onMainPinMousedown = function (evt) {
    evt.preventDefault();
    if (evt.button === Key.LEFT_MOUSE_BTN) {
      if (map.classList.contains('map--faded')) {
        activateMap();
      }
      window.dragMainPin(evt);
    }
  };
  var onMainPinEnterPress = function (evt) {
    evt.preventDefault();
    if (evt.key === Key.ENTER) {
      activateMap();
    }
  };

  var activateMap = function () {
    map.classList.remove('map--faded');
    enableForms();
    mainPin.removeEventListener('keydown', onMainPinEnterPress);
    window.load('GET', onRequestSuccess, onRequestError);
  };

  var deactivateMap = function () {
    filterForm.reset();
    adForm.reset();
    disableForms();
    resetAvatar();
    resetPhotos();
    invalidTitleMessageBox.classList.add('hidden');
    invalidPriceMessageBox.classList.add('hidden');
    clearMap();
    mainPin.style.left = (CenterPinCoord.X - MainPin.ROUND_SIDE / 2) + 'px';
    mainPin.style.top = (CenterPinCoord.Y - MainPin.ROUND_SIDE / 2) + 'px';
    map.classList.add('map--faded');
  };

  var enableForms = function () {
    adForm.classList.remove('ad-form--disabled');
    changeInputsState(adFormInputs);
  };
  var disableForms = function () {
    adForm.classList.add('ad-form--disabled');
    changeInputsState(adFormInputs, true);
    changeInputsState(filterFormInputs, true);
    setDefaultAddressValue();
    mainPin.addEventListener('mousedown', onMainPinMousedown);
    mainPin.addEventListener('keydown', onMainPinEnterPress);
  };

  var changeInputsState = function (inputs, isDisabled) {
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].disabled = isDisabled;
      markAsValid(inputs[i]);
    }
  };

  var setDefaultAddressValue = function () {
    adFormAddress.value = CenterPinCoord.X + ', ' + CenterPinCoord.Y;
  };

  var onRequestSuccess = function (data) {
    renderPins(data);
    changeInputsState(filterFormInputs);
  };

  // ======================= Валидация формы =======================

  // --------------------- Обработчики ---------------------

  var onAdTypeChange = function () {
    setMinPrice();
  };

  var onTimeoutChange = function () {
    adFormTimein.value = adFormTimeout.value;
  };
  var onTimeinChange = function () {
    adFormTimeout.value = adFormTimein.value;
  };

  var onRoomsChange = function () {
    switch (adFormRooms.value) {
      case RoomsQuantity[1]:
        changeCapacityOptionsState(true);
        GuestsOption[1].disabled = false;
        if (adFormCapacity.value !== GuestsNumber[1]) {
          adFormCapacity.value = GuestsNumber[1];
        }
        break;
      case RoomsQuantity[2]:
        changeCapacityOptionsState(true);
        GuestsOption[1].disabled = false;
        GuestsOption[2].disabled = false;
        if (adFormCapacity.value !== GuestsNumber[1]
            && adFormCapacity.value !== GuestsNumber[2]) {
          adFormCapacity.value = GuestsNumber[2];
        }
        break;
      case RoomsQuantity[3]:
        changeCapacityOptionsState(false);
        GuestsOption[0].disabled = true;
        if (adFormCapacity.value === GuestsNumber[0]) {
          adFormCapacity.value = GuestsNumber[3];
        }
        break;
      case RoomsQuantity[100]:
        changeCapacityOptionsState(true);
        GuestsOption[0].disabled = false;
        if (adFormCapacity.value !== GuestsNumber[0]) {
          adFormCapacity.value = GuestsNumber[0];
        }
        break;
      default:
        throw new Error(ErrorText.ROOMS);
    }
  };

  var onAdFormSubmit = function (evt) {
    adFormTitle.removeEventListener('input', onTitleInput);
    adFormPrice.removeEventListener('input', onPriceInput);
    evt.preventDefault();
    if (checkFormValidity()) {
      var adFormData = new FormData(adForm);
      window.load('POST', onPostSuccess, onRequestError, adFormData);
      deactivateMap();
    }
  };

  var onPostSuccess = function () {
    notify(successBlock);
  };

  // ------------------ Функции для валидации ------------------

  var changeCapacityOptionsState = function (isDisabled) {
    for (var i = 0; i < adFormCapacity.children.length; i++) {
      adFormCapacity.children[i].disabled = isDisabled;
    }
  };

  var setMinPrice = function () {
    adFormPrice.min = +houseTypeToMinPrice[adFormType.value];
    adFormPrice.placeholder = houseTypeToMinPrice[adFormType.value];
    return adFormPrice.placeholder;
  };

  var checkInputValidity = function (input) {
    if (!input.validity.valid) {
      markAsInvalid(input);
      return false;
    }
    markAsValid(input);
    return true;
  };

  var checkTitleValidity = function () {
    if (!adFormTitle.validity.valid) {
      markAsInvalid(adFormTitle);
      invalidTitleMessageBox.classList.remove('hidden');

      if (adFormTitle.validity.valueMissing) {
        invalidTitleMessageBox.textContent = InvalidText.EMPTY;
      } else if (adFormTitle.validity.tooShort || adFormTitle.validity.tooLong) {
        invalidTitleMessageBox.textContent = InvalidText.TITLE_LENGTH;
      }
      adFormTitle.addEventListener('input', onTitleInput);
      return false;
    }
    invalidTitleMessageBox.classList.add('hidden');
    markAsValid(adFormTitle);
    return true;
  };

  var checkPriceValidity = function () {
    if (!adFormPrice.validity.valid) {
      markAsInvalid(adFormPrice);
      invalidPriceMessageBox.classList.remove('hidden');

      if (adFormPrice.validity.valueMissing) {
        invalidPriceMessageBox.textContent = InvalidText.EMPTY;
      } else if (adFormPrice.validity.rangeUnderflow) {
        invalidPriceMessageBox.textContent =
          InvalidText.PRICE_MIN + setMinPrice() + '.';
      } else if (adFormPrice.validity.rangeOverflow) {
        invalidPriceMessageBox.textContent =
          InvalidText.PRICE_MAX;
      }
      adFormPrice.addEventListener('input', onPriceInput);
      return false;
    }
    invalidPriceMessageBox.classList.add('hidden');
    markAsValid(adFormPrice);
    return true;
  };

  var onTitleInput = function () {
    checkTitleValidity();
  };
  var onPriceInput = function () {
    checkPriceValidity();
  };

  var checkIfImage = function (input, label) {
    if (input.value && !input.value.match(imageRegExp)) {
      markAsInvalid(label);
      return false;
    }
    markAsValid(label);
    return true;
  };

  var checkFormValidity = function () {
    var isTitleValid = checkTitleValidity();
    var isPriceValid = checkPriceValidity();
    var isAddressValid = checkInputValidity(adFormAddress);
    var isAvatarValid = checkIfImage(adFormAvatar, adFormAvatarLabel);
    var isPhotosValid = checkIfImage(adFormPhotos, adFormPhotosLabel);
    return isTitleValid && isPriceValid && isAddressValid &&
           isAvatarValid && isPhotosValid;
  };

  var markAsInvalid = function (input) {
    input.style.boxShadow = '0 0 5px 0 red';
  };
  var markAsValid = function (input) {
    input.style.boxShadow = '';
  };

  // =================================================================

  disableForms();
  onRoomsChange();

  adFormType.addEventListener('change', onAdTypeChange);
  adFormTimeout.addEventListener('change', onTimeoutChange);
  adFormTimein.addEventListener('change', onTimeinChange);
  adFormRooms.addEventListener('change', onRoomsChange);
  adForm.addEventListener('submit', onAdFormSubmit);

  adFormResetBtn.addEventListener('click', function (evt) {
    evt.preventDefault();
    deactivateMap();
  });
})();
