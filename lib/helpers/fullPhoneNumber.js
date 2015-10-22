'use strict';

module.exports = function fullPhoneNumber (data) {

  if (!data.country_code || !data.phone_number){
    return;
  }

  return data.country_code + data.phone_number.replace(/^0+/, '');;
};
