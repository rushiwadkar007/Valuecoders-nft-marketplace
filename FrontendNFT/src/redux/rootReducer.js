import { combineReducers } from "redux";
import reducer from "./reducer";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; //type of storage (localStorage here)
//we can have 2 types of storege  localstorage and   sessionstorage

const persistConfig = {
  key: "root",
  storage,
  //contains reducers that we want to persist
};

const rootReducer = combineReducers({
  user: reducer,
});

export default persistReducer(persistConfig, rootReducer);
