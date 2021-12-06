import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
// import reducer from "./reducer";
import rootReducer from "./rootReducer";
import { persistStore } from "redux-persist";

export const store = createStore(rootReducer, composeWithDevTools());

export const persistor = persistStore(store);

export default { store, persistor };
