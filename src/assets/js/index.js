import { Ui } from "./ui";
import { Pages } from "./pages";

document.readyState !== 'loading' ? init() : document.addEventListener('DOMContentLoaded', init);

function init(){
	Ui()
	Pages()
}