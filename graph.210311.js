function createLineGraph(param) {

	if (!param['elem']) return window.alert('createGraph({\n\n   elem :   HTMLElement   is not found!\n\n});\n');
	if (!param['items']) return window.alert('createGraph({\n\n   items :   Array[...]   is not defined!\n\n});\n');

	let chart    = { class: param['elem'], elem: document.getElementsByClassName(param['elem'])[0], html: '' },
		items    = param['items'],
		lineOk   = (items.length > 1),
		summary  = 0,
		step     = { x: 0, y: 0, lft: 0, top: 0 },
		highest  = { value: items[0], index: 0 },
		lowest   = { value: 0, line: items[0], index: 0 },
		largest  = { item: items[0], index: 0 },
		smallest = { item: items[0], index: 0 },
		main     = { css: false, width: 2, half: 1, points: '' },
		trnd     = { css: false, width: 2, half: 1, points: '' },
		zero     = { css: false, width: 2, half: 1, points: '', top: 0 },
		sheets   = document.styleSheets, sheet;

	// CSS bontása:
	for (sheet in sheets) {
		if (!sheets.hasOwnProperty(sheet)) continue;
		let rules = sheets[sheet].cssRules, rule;
		for (rule in rules) {
			if (!rules.hasOwnProperty(rule)) continue;
			// Main Line ------------------------------->
			if (rules[rule].selectorText === ('.' + chart.class + '-main')) {
				main.width = (parseInt(rules[rule].style['stroke-width']) || 2);
				main.half = (main.width * 0.5);
				main.css = true;
			}
			// Trend Line ------------------------------>
			if (rules[rule].selectorText === ('.' + chart.class + '-trend')) {
				trnd.width = (parseInt(rules[rule].style['stroke-width']) || 2);
				trnd.half = (trnd.width * 0.5);
				trnd.css = true;
			}
			// Zero Line ------------------------------->
			if (rules[rule].selectorText === ('.' + chart.class + '-zero')) {
				zero.width = (parseInt(rules[rule].style['stroke-width']) || 2);
				zero.half = (zero.width * 0.5);
				zero.css = true;
			}
		}
	}


			// Egyenleg összeállítása:
			let balance = items.map(function(item, index) {
				// Értéknövelés:
				let value = (summary += item);
				// Magas, alacsony értékek:
				if (value >= highest.value) {
					highest.index = index;
					highest.value = value;
				}
				if (value <= lowest.value) lowest.value = value;
				// Legalacsonyabb vonal-index:
				if (value <= lowest.line) {
					lowest.index = index;
					lowest.line = value;
				}
				// Legkisebb, legnagyobb tételek:
				if (item >= largest.item) {
					largest.index = index;
					largest.item = item;
				}
				if (item <= smallest.item) {
					smallest.index = index;
					smallest.item = item;
				}
				return value;
			});


	// Méretek:
	chart.top = (chart.elem.offsetTop + chart.elem.clientTop);
	chart.left = (chart.elem.offsetLeft + chart.elem.clientLeft);
	chart.width = chart.elem.clientWidth;
	chart.height = chart.elem.clientHeight;
	chart.innerHeight = (chart.height - (main.width * 1.5));
	// Léptetések:
	step.lft = (chart.width / (balance.length - 1));
	step.top = (chart.innerHeight / (highest.value - lowest.value));
	zero.top = Math.round(chart.innerHeight + (lowest.value * step.top));

	let mAbs, mRel, mrAbs, mrRel, tAbs, tRel, zAbs, zRel,		// .push()
		hAbs, hRel, lAbs, lRel, rAbs, rRel, sAbs, sRel, x, y,	// [0,0]
		sTop, sHeight, sBottom, valueRate;

	// Alapértlmezés megadása a push funkcióhoz:
	if (lineOk) {
		mAbs = []; mRel = []; mrAbs = []; mrRel = []; tAbs = []; tRel = []; zAbs = []; zRel = [];
		sTop = (chart.top + main.width);
		sHeight = chart.innerHeight;
		sBottom = (sTop + sHeight);
		valueRate = ((highest.value - lowest.value) / sHeight);
	}


			// Egyenleg bontása:
			balance.map(function(value, index) {
				step.y = (chart.innerHeight - ((value - lowest.value) * step.top));
				// Vonal-grafikonhoz minimum 2 tétel kell:
				if (lineOk) {
					// Kezdőpont:
					if (index === 0) {
						main.points = ((-main.half) + ',' + (chart.innerHeight + main.width) + ' ' + (-main.half) + ',' + step.y + ' ' + main.half + ',' + step.y + ' ');
						trnd.points = ((-trnd.half) + ',' + step.y + ' ' + trnd.half + ',' + step.y + ' ');
					}
					// Végpont:
					else if (index === (balance.length - 1)) {
						main.points += ((chart.width - main.half) + ',' + step.y + ' ' + (chart.width + main.half) + ',' + step.y + ' ' + (chart.width + main.half) + ',' + (chart.innerHeight + main.width));
						trnd.points += ((chart.width - trnd.half) + ',' + step.y + ' ' + (chart.width + trnd.half) + ',' + step.y);
						zero.points = ((-zero.half) + ',' + (chart.innerHeight + main.width) + ' ' + (-zero.half) + ',' + zero.top + ' ' + (chart.width + zero.half) + ',' + zero.top + ' ' + (chart.width + zero.half) + ',' + (chart.innerHeight + main.width));
					}
					else {
						step.x += step.lft;
						main.points += (step.x + ',' + step.y + ' ');
					}
					x = ((index === 0) ? main.half : (index === (balance.length - 1)) ? (chart.width - main.half) : step.x);
					y = (step.y + main.width);
					// Minden main pont:
					mRel.push([x, y]);
					mAbs.push([(chart.left + x), (chart.top + y)]);
					// Kerekítettek:
					mrRel.push([Math.round(x * 100000), Math.round(y * 100000)]);
					mrAbs.push([Math.round((chart.left + x) * 100000), Math.round((chart.top + y) * 100000)]);
					// Legmagasabb, legalacsonyabb pontok:
					if (index === highest.index) {
						hRel = [x, y];
						hAbs = [(chart.left + x), (chart.top + y)];
					}
					if (index === lowest.index) {
						lRel = [x, y];
						lAbs = [(chart.left + x), (chart.top + y)];
					}
					// Legnagyobb, legkisebb tételek:
					if (index === largest.index) {
						rRel = [x, y];
						rAbs = [(chart.left + x), (chart.top + y)];
					}
					if (index === smallest.index) {
						sRel = [x, y];
						sAbs = [(chart.left + x), (chart.top + y)];
					}
					// Trend pontok:
					if (index === 0) {
						x -= main.half;
						x += trnd.half;
						tRel.push([x, y]);
						tAbs.push([(chart.left + x), (chart.top + y)]);
					}
					if (index === (balance.length - 1)) {
						x += main.half;
						x -= trnd.half;
						tRel.push([x, y]);
						tAbs.push([(chart.left + x), (chart.top + y)]);
					}
					// Zero pontok:
					if (index === 0) {
						zRel = [[zero.half, (zero.top + main.width)], [(chart.width - zero.half), (zero.top + main.width)]];
						zAbs = [[(chart.left + zRel[0][0]), (chart.top + zRel[0][1])], [(chart.left + zRel[1][0]), (chart.top + zRel[1][1])]];
					}
				}
			});


	// HTML összeállítása:
	if (main.css) chart.html += ('<svg style="position:absolute;width:' + chart.width + 'px;height:' + chart.innerHeight + 'px;margin-top:' + main.width + 'px;overflow:visible;z-index:1;"><polyline points="' + main.points + '" class="' + chart.class + '-main"></svg>');
	if (trnd.css) chart.html += ('<svg style="position:absolute;width:' + chart.width + 'px;height:' + chart.innerHeight + 'px;margin-top:' + main.width + 'px;overflow:visible;z-index:1;"><polyline points="' + trnd.points + '" class="' + chart.class + '-trend"></svg>');
	if (zero.css) chart.html += ('<svg style="position:absolute;width:' + chart.width + 'px;height:' + chart.innerHeight + 'px;margin-top:' + main.width + 'px;overflow:visible;z-index:1;"><polyline points="' + zero.points + '" class="' + chart.class + '-zero"></svg>');
	// Integrálás:
	chart.elem.style.overflow = 'hidden';
	chart.elem.innerHTML = chart.html;

	// noinspection JSUnusedAssignment
	return {
		elem	: chart.elem,
		top		: chart.top,
		left	: chart.left,
		width	: chart.width,
		height	: chart.height,
		inner	: {
			top		: sTop,
			left	: chart.left,
			width	: chart.width,
			height	: sHeight
		},
		values	: {
			highest	 : highest.value,
			lowest	 : lowest.line,
			largest	 : largest.item,
			smallest : smallest.item
		},
		points	: {
			main  : { abs: mAbs, rel: mRel },
			trend : { abs: tAbs, rel: tRel },
			zero  : { abs: zAbs, rel: zRel },
			highest	 : { abs: hAbs, rel: hRel },
			lowest	 : { abs: lAbs, rel: lRel },
			largest	 : { abs: rAbs, rel: rRel },
			smallest : { abs: sAbs, rel: sRel }
		},
		valueByAbsPixel: function(pixel) {
			if (!lineOk) return undefined;
			pixel += (chart.elem.offsetTop - chart.elem.getBoundingClientRect().top);
			if (pixel >= sBottom) return lowest.value;
			else if (pixel <= sTop) return highest.value;
			else return (((sBottom - pixel) * valueRate) + lowest.value);
		},
		relPointByLimit: function(x, y, l) {
			let rect = chart.elem.getBoundingClientRect(), rectTop = (chart.elem.offsetTop - rect.top), rectLeft = (chart.elem.offsetLeft - rect.left);
			if (x !== false) x = Math.round(((x + rectLeft) - chart.left) * 100000);
			if (y !== false) y = Math.round(((y + rectTop) - chart.top) * 100000);
			l = Math.round(l * 10000);
			let f, top, left;
			mrRel.map(function(p, i) {
				top = (y === false ? true : ((y >= (p[1]-l)) && (y <= (p[1]+l))));
				left = (x === false ? true : ((x >= (p[0]-l)) && (x <= (p[0]+l))));
				if (top && left) f = mRel[i];
			});
			return f;
		},
		absPointByLimit: function(x, y, l) {
			let rect = chart.elem.getBoundingClientRect(), rectTop = (chart.elem.offsetTop - rect.top), rectLeft = (chart.elem.offsetLeft - rect.left);
			if (x !== false) x = Math.round((x + rectLeft) * 100000);
			if (y !== false) y = Math.round((y + rectTop) * 100000);
			l = Math.round(l * 10000);
			let f, top, left;
			mrAbs.map(function(p, i) {
				top = (y === false ? true : ((y >= (p[1]-l)) && (y <= (p[1]+l))));
				left = (x === false ? true : ((x >= (p[0]-l)) && (x <= (p[0]+l))));
				if (top && left) f = [mAbs[i][0] - rectLeft, mAbs[i][1] - rectTop];
			});
			return f;
		}
	}
}

function createColumnGraph(param) {

	if (!param['elem']) return window.alert('createGraph({\n\n   elem :   HTMLElement   is not found!\n\n});\n');
	if (!param['items']) return window.alert('createGraph({\n\n   items :   Array[...]   is not defined!\n\n});\n');

	let chart    = { class: param['elem'], elem: document.getElementsByClassName(param['elem'])[0], html: '' },
		items    = param['items'],
		columnOk = (items.length > 0),
		summary  = 0,
		step     = { x: 0, y: 0, lft: 0, top: 0 },
		largest  = { item: 0, index: 0 },
		smallest = { item: 0, index: 0 },
		clmn     = { css: false, width: 2, border: 0 },
		avrg     = { css: false, width: 2, half: 1, points: '', top: 0 },
		zero     = { css: false, width: 2, half: 1, points: '', top: 0, btm: 0 },
		sheets   = document.styleSheets, sheet;

	// CSS bontása:
	for (sheet in sheets) {
		if (!sheets.hasOwnProperty(sheet)) continue;
		let rules = sheets[sheet].cssRules, rule;
		for (rule in rules) {
			if (!rules.hasOwnProperty(rule)) continue;
			// Main Column ----------------------------->
			if (rules[rule].selectorText === ('.' + chart.class + '-main')) {
				clmn.width = ((parseInt(rules[rule].style['max-width']) * 0.01) || 1);
				clmn.border = (parseInt(rules[rule].style['border-width']) || 0);
				clmn.css = true;
			}
			// Average Line ---------------------------->
			if (rules[rule].selectorText === ('.' + chart.class + '-avg')) {
				avrg.width = (parseInt(rules[rule].style['stroke-width']) || 2);
				avrg.half = (avrg.width * 0.5);
				avrg.css = true;
			}
			// Zero Line ------------------------------->
			if (rules[rule].selectorText === ('.' + chart.class + '-zero')) {
				zero.width = (parseInt(rules[rule].style['stroke-width']) || 2);
				zero.half = (zero.width * 0.5);
				zero.css = true;
			}
		}
	}


			// Tételek bontása:
			items.map(function(item, index) {
				if (item >= largest.item) {
					largest.index = index;
					largest.item = item;
				}
				if (item <= smallest.item) {
					smallest.index = index;
					smallest.item = item;
				}
				summary += item;
			});


	// Méretek:
	chart.top = (chart.elem.offsetTop + chart.elem.clientTop);
	chart.left = (chart.elem.offsetLeft + chart.elem.clientLeft);
	chart.width = chart.elem.clientWidth;
	chart.height = chart.elem.clientHeight;
	chart.innerHeight = (chart.height - zero.width);
	// Léptetések:
	step.lft = (chart.width / items.length);
	step.top = (chart.innerHeight / (largest.item - smallest.item));
	step.x += (step.lft * 0.5);
	zero.top = Math.round((chart.innerHeight + (smallest.item * step.top)) + zero.half);
	zero.btm = (chart.height - zero.top);
	avrg.top = (chart.height - ((((summary / items.length) - smallest.item) * step.top) + avrg.half));

	// noinspection JSUnusedLocalSymbols
	let mAbs, mRel, mrAbs, mrRel, aAbs, aRel, zAbs, zRel,		// .push()
		hAbs, hRel, lAbs, lRel, rAbs, rRel, sAbs, sRel,			// [0,0]
		sTop, sHeight, sBottom, valueRate, native, x, y, b, h;

	// Alapértlmezés megadása a push funkcióhoz:
	if (columnOk) {
		mAbs = []; mRel = []; mrAbs = []; mrRel = []; aAbs = []; aRel = []; zAbs = []; zRel = [];
		sTop = (chart.top + zero.half);
		sHeight = chart.innerHeight;
		sBottom = (sTop + sHeight);
		valueRate = ((largest.item - smallest.item) / sHeight);
	}


			// Tételek bontása:
			items.map(function(item, index) {
				if (columnOk) {
					// Negatív az oszlop:
					native = (item < 0);
					// Ha negatív az oszlop, akkor megfordítás:
					if (native) item = Math.abs(item);
					// Left érték:
					x = Math.round(step.x);
					// Top érték zéró-vonal vagy az oszlop teteje:
					y = Math.round(native ? zero.top : (((largest.item - item) * step.top) + zero.half));
					// Bottom érték az oszlop alja vagy a zéró-vonal:
					b = Math.round((native ? (zero.btm - (item * step.top)) : zero.btm));
					// Magasság:
					h = Math.round(native ? (zero.btm - b) : (zero.top - y));
					// HTML összeállítás:
					chart.html += ('<div class=' + chart.class + '-main style="position:absolute;\
						width:' + Math.round(clmn.width * step.lft) + 'px;height:auto;\
						top:' + y + 'px;\
						bottom:' + b + 'px;\
						left:' + x + 'px;\
						' + ((h < clmn.border) ? ('border-width:' + h + 'px;') : '') + '\
						border' + (native ? '-top' : '-bottom') + ':none;\
						transform:translate(-50%,0);box-sizing:border-box;"></div>').replace(/[\t\n]/g, '');
					// Negatív oszlopnál a bottom érték megadása:
					if (native) y = ((chart.innerHeight - b) + zero.width);
					// Pontok megadása:
					mRel.push([x, y]);
					mAbs.push([(chart.left + x), (chart.top + y)]);
					// Kerekítettek:
					mrRel.push([Math.round(x * 100000), Math.round(y * 100000)]);
					mrAbs.push([Math.round((chart.left + x) * 100000), Math.round((chart.top + y) * 100000)]);
					// Legnagyobb, legkisebb tételek:
					if (index === largest.index) {
						rRel = [x, y];
						rAbs = [(chart.left + x), (chart.top + y)];
					}
					if (index === smallest.index) {
						sRel = [x, y];
						sAbs = [(chart.left + x), (chart.top + y)];
					}
					if (index === 0) {
						// Átlag vonal:
						avrg.points = ((-avrg.half) + ',' + avrg.top + ' ' + (chart.width + avrg.half) + ',' + avrg.top);
						// Átlag pontok:
						aRel = [[avrg.half, avrg.top], [(chart.width - avrg.half), avrg.top]];
						aAbs = [[(chart.left + aRel[0][0]), (chart.top + aRel[0][1])], [(chart.left + aRel[1][0]), (chart.top + aRel[1][1])]];
						// Zéro vonal:
						zero.points = ((-zero.half) + ',' + chart.height + ' ' + (-zero.half) + ',' + zero.top +  ' ' + (chart.width + zero.half) + ',' + zero.top + ' ' + (chart.width + zero.half) + ',' + chart.height);
						// Zero pontok:
						zRel = [[zero.half, zero.top], [(chart.width - zero.half), zero.top]];
						zAbs = [[(chart.left + zRel[0][0]), (chart.top + zRel[0][1])], [(chart.left + zRel[1][0]), (chart.top + zRel[1][1])]];
					}
					//----------------->
					step.x += step.lft;
				}
			});


	// HTML összeállítás:
	if (avrg.css) chart.html += ('<svg style="position:absolute;width:' + chart.width + 'px;height:' + chart.height + 'px;overflow:visible;z-index:1;"><polyline points="' + avrg.points + '" class="' + chart.class + '-avg"></svg>');
	if (zero.css) chart.html += ('<svg style="position:absolute;width:' + chart.width + 'px;height:' + chart.height + 'px;overflow:visible;z-index:1;"><polyline points="' + zero.points + '" class="' + chart.class + '-zero"></svg>');
	// Integrálás:
	chart.elem.style.overflow = 'hidden';
	chart.elem.innerHTML = chart.html;

	// noinspection JSUnusedAssignment
	return {
		elem	: chart.elem,
		top		: chart.top,
		left	: chart.left,
		width	: chart.width,
		height	: chart.height,
		inner	: {
			top		: sTop,
			left	: chart.left,
			width	: chart.width,
			height	: sHeight
		},
		values	: {
			largest	 : largest.item,
			smallest : smallest.item
		},
		points	: {
			main : { abs: mAbs, rel: mRel },
			avg  : { abs: aAbs, rel: aRel },
			zero : { abs: zAbs, rel: zRel },
			largest	 : { abs: rAbs, rel: rRel },
			smallest : { abs: sAbs, rel: sRel }
		},
		valueByAbsPixel: function(pixel) {
			if (!columnOk) return undefined;
			pixel += (chart.elem.offsetTop - chart.elem.getBoundingClientRect().top);
			if (pixel >= sBottom) return smallest.item;
			else if (pixel <= sTop) return largest.item;
			else return (((sBottom - pixel) * valueRate) + smallest.item);
		},
		relPointByLimit: function(x, y, l) {
			let rect = chart.elem.getBoundingClientRect(), rectTop = (chart.elem.offsetTop - rect.top), rectLeft = (chart.elem.offsetLeft - rect.left);
			if (x !== false) x = Math.round(((x + rectLeft) - chart.left) * 100000);
			if (y !== false) y = Math.round(((y + rectTop) - chart.top) * 100000);
			l = Math.round(l * 10000);
			let f, top, left;
			mrRel.map(function(p, i) {
				top = (y === false ? true : ((y >= (p[1]-l)) && (y <= (p[1]+l))));
				left = (x === false ? true : ((x >= (p[0]-l)) && (x <= (p[0]+l))));
				if (top && left) f = mRel[i];
			});
			return f;
		},
		absPointByLimit: function(x, y, l) {
			let rect = chart.elem.getBoundingClientRect(), rectTop = (chart.elem.offsetTop - rect.top), rectLeft = (chart.elem.offsetLeft - rect.left);
			if (x !== false) x = Math.round((x + rectLeft) * 100000);
			if (y !== false) y = Math.round((y + rectTop) * 100000);
			l = Math.round(l * 10000);
			let f, top, left;
			mrAbs.map(function(p, i) {
				top = (y === false ? true : ((y >= (p[1]-l)) && (y <= (p[1]+l))));
				left = (x === false ? true : ((x >= (p[0]-l)) && (x <= (p[0]+l))));
				if (top && left) f = [mAbs[i][0] - rectLeft, mAbs[i][1] - rectTop];
			});
			return f;
		}
	}
}
