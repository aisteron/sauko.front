import {qs} from '../libs';

export function Ui(){
	dropdowns()
}

function dropdowns(){
	// header tel
	if(qs('header .tel.dd')){
		qs('header .tel.dd span.head').addEventListener("click", event => {
			qs('header .tel.dd').classList.toggle("open")
		})
	}
}