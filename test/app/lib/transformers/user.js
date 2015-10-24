'use strict'

const helpers = require(`${process.cwd()}/lib/helpers`);

module.exports = function* (cfg, ctx, data) {

    let d = {
      id: data._id || 'gash',
      username: data.display_name || data.username,
      country_code: data.country_code,
      phone_number: data.phone_number,
      updated_at: data.updated_at || data.created_at,

      following: data.following,
      followers: data.followers,

      last_online: data.last_online || data.created_at
    };

    if (data.last_location && data.last_location.location) {

      d.last_location = data.last_location;
    }

    d.full_phone_number = helpers.fullPhoneNumber(data);

    Object.assign(d, data.profile);

    d._links = data._links;

    return d;
}
