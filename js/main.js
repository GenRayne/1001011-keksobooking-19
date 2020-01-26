'use strict';

var map = document.querySelector('.map');
map.classList.remove('map--faded');

var createPins = function () {
  var ads = generateAdsList();
  var pinsBlock = map.querySelector('.map__pins');

  for (var i = 0; i < ads.length; i++) {
    var newPin = createPin(ads, i);
    pinsBlock.appendChild(newPin);
  }
};

var createPin = function (ads, i) {
  var pinTemplate = document.querySelector('#pin').content;
  var newPin = pinTemplate.cloneNode(true);
  var pinButton = newPin.querySelector('.map__pin');
  var offsetX = 50 / 2;
  var offsetY = 70;

  pinButton.style = 'left: ' + (ads[i].location.x - offsetX) + 'px; top: ' + (ads[i].location.y - offsetY) + 'px;';
  var pinImg = newPin.querySelector('img');
  pinImg.src = ads[i].author.avatar;
  pinImg.alt = ads[i].offer.title;

  return newPin;
};

// Создание псевдоданных

var generateAdsList = function (quantity) {
  var ads = [];
  if (!quantity) {
    quantity = 8;
  }
  for (var i = 0; i < quantity; i++) {
    var newAd = generateNewAd();
    ads.push(newAd);
  }
  return ads;
};

var generateNewAd = function () {
  var location = generateLocation();
  var newAd = {
    author: {
      avatar: generateUrl()
    },
    offer: {
      title: 'Уютное место №' + Math.ceil(Math.random() * 100),
      address: location.x + ', ' + location.y,
      price: Math.round(Math.random() * (10000 - 1000) + 1000),
      type: chooseType(),
      rooms: Math.ceil(Math.random() * 10),
      guests: Math.ceil(Math.random() * 10),
      checkin: chooseCheckinCheckout(),
      checkout: chooseCheckinCheckout(),
      features: chooseFeatures(),
      description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Magnam quis molestiae placeat architecto nihil temporibus repellendus rerum ut magni ducimus!',
      photos: generatePhotoCollection()
    },
    location: location
  };
  return newAd;
};

var generateUrl = function () {
  var number = Math.ceil(Math.random() * 8);
  var url = 'img/avatars/user0' + number + '.png';
  return url;
};

var chooseType = function () {
  var types = ['palace', 'flat', 'house', 'bungalo'];
  return types[Math.round(Math.random() * (types.length - 1))];
};

var chooseCheckinCheckout = function () {
  var times = ['12:00', '13:00', '14:00'];
  return times[Math.round(Math.random() * (times.length - 1))];
};

var chooseFeatures = function () {
  var features = ['wifi', 'dishwasher', 'parking', 'washer', 'elevator', 'conditioner'];
  var chosenFeatures = [];
  var chosenFeaturesQuantity = Math.ceil(Math.random() * features.length);
  for (var i = 0; i < chosenFeaturesQuantity; i++) {
    var newFeature = chooseNewFeature(features);
    while (chosenFeatures.includes(newFeature)) {
      newFeature = chooseNewFeature(features);
    }
    chosenFeatures.push(newFeature);
  }
  return chosenFeatures;
};

var chooseNewFeature = function (features) {
  var newFeatureIndex = Math.round(Math.random() * (features.length - 1));
  return features[newFeatureIndex];
};

var generatePhotoCollection = function () {
  var photoUrls = ['http://o0.github.io/assets/images/tokyo/hotel1.jpg', 'http://o0.github.io/assets/images/tokyo/hotel2.jpg', 'http://o0.github.io/assets/images/tokyo/hotel3.jpg'];
  photoUrls.length = Math.ceil(Math.random() * photoUrls.length);
  return photoUrls;
};

var generateLocation = function () {
  var maxX = +window.getComputedStyle(map).width.slice(0, -2);
  var minY = 130;
  var maxY = 630;
  return {
    x: Math.round(Math.random() * maxX),
    y: Math.round(Math.random() * (maxY - minY) + minY)
  };
};

createPins();
