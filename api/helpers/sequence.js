'use strict';

const log = require('../../api/helpers/log')('helper:sequence');

class Sequence {
  constructor(model, field, scope = null) {
    this.config = { model, field, scope };
  }

  get next() {
    return new Promise((resolve, reject) => {
      Counter.findOneAndUpdate(
        this.config,
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
      )
        .then(counter => {
          resolve(counter.seq);
        })
        .catch(err => {
          log.error('Error trying to get next value for sequence:');
          log.error(this.config);
          log.error(err);
          reject(err);
        });
    });
  }
}

module.exports = Sequence;