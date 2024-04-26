import { Ui } from "./ui";
import { Pages } from "./pages";
import { runMetrika } from "./libs";


document.readyState !== 'loading' ? init() : document.addEventListener('DOMContentLoaded', init);

function init(){
	Ui()
	Pages()
	runMetrika(44704858)	
}