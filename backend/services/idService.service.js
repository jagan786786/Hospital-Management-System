const Counter = require('../models/counter.model');

const getNextSequence = async (counterName) => {
  const updated = await Counter.findByIdAndUpdate(
    counterName,
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return updated.seq;
};

const generateEmployeeId = async (prefix = 'EMP', padding = 6) => {
  const seq = await getNextSequence('employeeId');
  const numberPart = seq.toString().padStart(padding, '0');
  return `${prefix}${numberPart}`;
};

module.exports = { generateEmployeeId };
