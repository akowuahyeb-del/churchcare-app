let presentList = [];

let listeners = [];

/* ✅ ADD ATTENDANCE */
export const addAttendance = (record) => {
  presentList.push(record);
  notify();
};

/* ✅ GET ALL */
export const getAttendance = () => {
  return presentList;
};

/* ✅ SUBSCRIBE FOR LIVE UPDATE */
export const subscribe = (callback) => {
  listeners.push(callback);
};

/* ✅ CLEAR (optional later) */
export const clearAttendance = () => {
  presentList = [];
  notify();
};

/* ✅ NOTIFY ALL SCREENS */
const notify = () => {
  listeners.forEach((cb) => cb([...presentList]));
};