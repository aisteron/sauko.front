import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux'
import { store } from './assets/js/react/orderForm/store.js';

import { qs } from './assets/js/libs';
import { OrderForm } from './assets/js/react/orderForm/index.jsx';


const rootForm = createRoot(qs('#orderForm'));

rootForm.render(
	<Provider store={store}>
		<OrderForm/>
	</Provider>
)


