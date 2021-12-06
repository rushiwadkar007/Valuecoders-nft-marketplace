const initialState = {
  userDetails: [],
  error: "",
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "AddDetails":
      return {
        userDetails: action.payload,
        error: "",
      };

    case "UpdateUsername":
      return {
        userDetails: { ...state.userDetails, name: action.payload },
        error: "",
      };

    case "removeDetails":
      return {
        userDetails: [],
        error: "",
      };

    default:
      return state;
  }
};

export default reducer;
