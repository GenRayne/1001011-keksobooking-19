'use strict';

(function () {
  // --------------------- Импорт ---------------------

  var Key = window.util.Key;
  var InvalidText = window.util.InvalidText;

  var showNotification = window.notifications.showNotification;
  var successBlock = window.notifications.successBlock;

  var map = window.pins.map;
  var MainPin = window.pins.MainPin;
  var mainPinEl = window.pins.mainPinEl;
  var clearMap = window.pins.clearMap;
  var createPins = window.pins.createPins;

  var HouseTypeToMinPrice = window.util.HouseTypeToMinPrice;
  var RoomsQuantity = window.util.RoomsQuantity;
  var GuestsNumber = window.util.GuestsNumber;
  var GuestsOptions = window.util.GuestsOption;

  var filterForm = window.filter.filterForm;
  var filterFormInputs = window.filter.filterFormInputs;
  var onRequestError = window.filter.onRequestError;

  // ---------------- Переменные формы ----------------

  var MAP_WIDTH = map.offsetWidth;
  var imageRegExp = /.jpg$|.jpeg$|.png$/i;
  var pointerPinCoords = (MAP_WIDTH / 2) + ', ' + (MainPin.START_Y + MainPin.HEIGHT);
  var centerPinCoords = (MAP_WIDTH / 2) + ', ' + (MainPin.START_Y + MainPin.ROUND_SIDE / 2);

  var adForm = document.querySelector('.ad-form');
  var adFormAvatar = adForm.querySelector('#avatar');
  var adFormAvatarLabel = adForm.querySelector('.ad-form-header__drop-zone');
  var adFormTitle = adForm.querySelector('#title');
  var adFormAddress = adForm.querySelector('#address');
  var adFormType = adForm.querySelector('#type');
  var adFormPrice = adForm.querySelector('#price');
  var adFormTimein = adForm.querySelector('#timein');
  var adFormTimeout = adForm.querySelector('#timeout');
  var adFormRooms = adForm.querySelector('#room_number');
  var adFormCapacity = adForm.querySelector('#capacity');
  var adFormFeatures = adForm.querySelector('.features');
  var adFormDescription = adForm.querySelector('#description');
  var adFormPhotos = adForm.querySelector('#images');
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

  var onMainPinMousedown = function (ev) {
    if (ev.button === Key.LEFT_MOUSE_BTN) {
      activateMap();
    }
  };
  var onMainPinEnterPress = function (ev) {
    if (ev.key === Key.ENTER) {
      activateMap();
    }
  };

  var activateMap = function () {
    map.classList.remove('map--faded');
    enableForms();
    setDefaultAddressValue(true);
    mainPinEl.removeEventListener('mousedown', onMainPinMousedown);
    mainPinEl.removeEventListener('keydown', onMainPinEnterPress);
    window.request('GET', createPins, onRequestError);
  };

  var deactivateMap = function () {
    filterForm.reset();
    adForm.reset();
    disableForms();
    invalidTitleMessageBox.classList.add('hidden');
    invalidPriceMessageBox.classList.add('hidden');
    clearMap();
    map.classList.add('map--faded');
  };

  var enableForms = function () {
    adForm.classList.remove('ad-form--disabled');
    changeInputsState(adFormInputs);
    changeInputsState(filterFormInputs);
  };
  var disableForms = function () {
    adForm.classList.add('ad-form--disabled');
    changeInputsState(adFormInputs, true);
    changeInputsState(filterFormInputs, true);
    setDefaultAddressValue();
    mainPinEl.addEventListener('mousedown', onMainPinMousedown);
    mainPinEl.addEventListener('keydown', onMainPinEnterPress);
  };

  var changeInputsState = function (inputsArr, isDisabled) {
    for (var i = 0; i < inputsArr.length; i++) {
      inputsArr[i].disabled = isDisabled;
      markAsValid(inputsArr[i]);
    }
  };

  var setDefaultAddressValue = function (isActive) {
    adFormAddress.value = isActive ? pointerPinCoords : centerPinCoords;
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
        GuestsOptions[1].disabled = false;
        if (adFormCapacity.value !== GuestsNumber[1]) {
          adFormCapacity.value = GuestsNumber[1];
        }
        break;
      case RoomsQuantity[2]:
        changeCapacityOptionsState(true);
        GuestsOptions[1].disabled = false;
        GuestsOptions[2].disabled = false;
        if (adFormCapacity.value !== GuestsNumber[1]
            && adFormCapacity.value !== GuestsNumber[2]) {
          adFormCapacity.value = GuestsNumber[2];
        }
        break;
      case RoomsQuantity[3]:
        changeCapacityOptionsState(false);
        GuestsOptions[0].disabled = true;
        if (adFormCapacity.value === GuestsNumber[0]) {
          adFormCapacity.value = GuestsNumber[3];
        }
        break;
      case RoomsQuantity[100]:
        changeCapacityOptionsState(true);
        GuestsOptions[0].disabled = false;
        if (adFormCapacity.value !== GuestsNumber[0]) {
          adFormCapacity.value = GuestsNumber[0];
        }
        break;
      default:
        throw new Error(ErrorText.ROOMS);
    }
  };

  var onAdFormSubmit = function (ev) {
    adFormTitle.removeEventListener('input', onTitleInput);
    adFormPrice.removeEventListener('input', onPriceInput);
    ev.preventDefault();
    if (checkFormValidity()) {
      var adFormData = new FormData(adForm);
      window.request('POST', onPostSuccess, onRequestError, adFormData);
      deactivateMap();
    }
  };

  var onPostSuccess = function () {
    showNotification(successBlock);
  };

  // ------------------ Функции для валидации ------------------

  var changeCapacityOptionsState = function (isDisabled) {
    for (var i = 0; i < adFormCapacity.children.length; i++) {
      adFormCapacity.children[i].disabled = isDisabled;
    }
  };

  var setMinPrice = function () {
    adFormPrice.min = +HouseTypeToMinPrice[adFormType.value];
    adFormPrice.placeholder = HouseTypeToMinPrice[adFormType.value];
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

  adFormResetBtn.addEventListener('click', function (ev) {
    ev.preventDefault();
    deactivateMap();
  });
})();
