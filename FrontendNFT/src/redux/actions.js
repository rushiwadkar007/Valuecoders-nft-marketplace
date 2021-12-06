export const addDetails = (userDetails) => {
  return {
    type: "AddDetails",
    payload: userDetails,
  };
};

export const removeDetails = () => {
  return {
    type: "removeDetails",
  };
};

export const updateUsername = (name) => {
  return {
    type: "UpdateUsername",
    payload: name,
  };
};
