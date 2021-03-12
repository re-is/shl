function createLineGraph(param) {

	if (!param['elem']) return window.alert('createGraph({\n\n   elem :   HTMLElement   is not found!\n\n});\n');
	if (!param['items']) return window.alert('createGraph({\n\n   items :   Array[...]   is not defined!\n\n});\n');

	let chart    = { class: param['elem'], elem: document.getElementsByClassName(param['elem'])[0], html: '' },
		items    = param['items'],
		lineOk   = (items.length > 1),
		summary  = 0,
		step     = { x: 0, y: 0, top: 0, left: 0, value: 0 },
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


	// Méretek ----------------------------------------------------------------------->
	chart.offset		= (function() { let c = chart.elem.getBoundingClientRect(); return { top: Math.round(chart.elem.offsetTop - c.top), left: Math.round(chart.elem.offsetLeft - c.left) } });
	chart.top			= (chart.elem.offsetTop + chart.elem.clientTop);
	chart.left			= (chart.elem.offsetLeft + chart.elem.clientLeft);
	chart.width			= chart.elem.clientWidth;
	chart.height		= chart.elem.clientHeight;
	chart.innerHeight	= (chart.height - (main.width * 1.5));
	// Léptetések -------------------------------------------------------------------->
	step.left			= (chart.width / (balance.length - 1));
	step.top			= (chart.innerHeight / (highest.value - lowest.value));
	step.value			= ((highest.value - lowest.value) / chart.innerHeight);
	zero.top			= Math.round(chart.innerHeight + (lowest.value * step.top));

	let mAbs = [], mRel = [], mrAbs = [], mrRel = [], tAbs = [], tRel = [], zAbs = [], zRel = [],
		hAbs = [], hRel = [], lAbs = [], lRel = [], rAbs = [], rRel = [], sAbs = [], sRel = [],
		x, y, sTop = (chart.top + main.width);


			// Egyenleg bontása:
			balance.map(function(value, index) {
				step.y = ((step.top === Infinity) ? chart.innerHeight : (chart.innerHeight - ((value - lowest.value) * step.top)));
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
						step.x += step.left;
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
						if (step.top === Infinity) zero.top = chart.innerHeight;
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

	return {
		elem	: chart.elem,
		top		: chart.top,
		left	: chart.left,
		width	: chart.width,
		height	: chart.height,
		inner	: {
			top		: sTop,
			left	: chart.left,
			bottom	: (sTop + chart.innerHeight),
			right	: (chart.left + chart.width),
			width	: chart.width,
			height	: chart.innerHeight
		},
		values	: {
			highest	 : highest.value,
			lowest	 : lowest.line,
			largest	 : largest.item,
			smallest : smallest.item,
			summary	 : balance,
			items	 : items
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
		clientOffset: chart.offset,
		pointByCursor: function(x, y) {
			let offset = chart.offset();
			x += (offset.left - chart.left);
			y += (offset.top - chart.top);
			return (((x >= 0) && (x <= chart.width) && (y >= 0) && (y <= chart.height)) ? [x, y] : false);
		},
		valueByPixel: function(pixel) {
			if (!lineOk) return 0;
			pixel -= main.width;
			if (pixel >= chart.innerHeight) return lowest.value;
			else if (pixel <= 0) return highest.value;
			else return (((chart.innerHeight - pixel) * step.value) + lowest.value);
		},
		dataByPoint: function(x, y, l) {
			if (!lineOk) return undefined;
			if (x[1]) { l = y; y = x[1]; x = x[0] }
			if (x !== false) x = Math.round(x * 100000);
			if (y !== false) y = Math.round(y * 100000);
			let data, top, left, offset = chart.offset();
			l = Math.round((l || 10) * 10000);
			mrRel.map(function(p, i) {
				top = ((y === false) ? true : ((y >= (p[1]-l)) && (y <= (p[1]+l))));
				left = ((x === false) ? true : ((x >= (p[0]-l)) && (x <= (p[0]+l))));
				if (top && left) data = { index: i, item: items[i], summary: balance[i], rel: mRel[i], abs: [mAbs[i][0] - offset.left, mAbs[i][1] - offset.top] };
			});
			return data;
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
		balance  = [],
		step     = { x: 0, y: 0, top: 0, left: 0 },
		largest  = { item: 0, index: 0 },
		smallest = { item: 0, index: 0 },
		clmn     = { css: false, width: 1, border: 0 },
		avrg     = { css: false, width: 2, half: 1, points: '', top: 0 },
		zero     = { css: false, width: 2, half: 1, points: '', top: 0, bottom: 0 },
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
				balance.push(summary);
			});


	// Méretek ----------------------------------------------------------------------->
	chart.offset		= (function() { let c = chart.elem.getBoundingClientRect(); return { top: Math.round(chart.elem.offsetTop - c.top), left: Math.round(chart.elem.offsetLeft - c.left) } });
	chart.top			= (chart.elem.offsetTop + chart.elem.clientTop);
	chart.left			= (chart.elem.offsetLeft + chart.elem.clientLeft);
	chart.width			= chart.elem.clientWidth;
	chart.height		= chart.elem.clientHeight;																	// 100
	chart.innerHeight	= (chart.height - zero.width);																// 98
	// Léptetések -------------------------------------------------------------------->
	step.left			= (chart.width / items.length);
	step.top			= (chart.innerHeight / (largest.item - smallest.item));
	step.value			= ((largest.item - smallest.item) / chart.innerHeight);
	step.x				= (step.x + (step.left * 0.5));
	zero.top			= Math.round((chart.innerHeight + (smallest.item * step.top)) + zero.half);					// 99
	zero.bottom			= (chart.height - zero.top);																// 1
	avrg.top			= (chart.height - ((((summary / items.length) - smallest.item) * step.top) + avrg.half));	// 50

	let mAbs = [], mRel = [], mrAbs = [], mrRel = [], aAbs = [], aRel = [], zAbs = [], zRel = [],
		rAbs = [], rRel = [], sAbs = [], sRel = [],
		x, y, b, h, sTop = (chart.top + zero.half);


			// Tételek bontása:
			items.map(function(item, index) {
				if (columnOk) {
					// Negatív az oszlop:
					native = (item < 0);
					// Ha negatív az oszlop, akkor megfordítás:
					if (native) item = Math.abs(item);
					// Left érték:
					x = step.x;
					// Top érték zéró-vonal vagy az oszlop teteje:
					y = ((step.top === Infinity) ? (chart.innerHeight + zero.half) : (native ? zero.top : (((largest.item - item) * step.top) + zero.half)));
					// Bottom érték az oszlop alja vagy a zéró-vonal:
					b = ((step.top === Infinity) ? 0 : ((native ? (zero.bottom - (item * step.top)) : zero.bottom)));
					// Magasság:
					h = ((step.top === Infinity) ? zero.half : (native ? (zero.bottom - b) : (zero.top - y)));
					// HTML összeállítás:
					chart.html += ('<div class=' + chart.class + '-main style="position:absolute;\
						width:' + (clmn.width * step.left) + 'px;height:auto;\
						top:' + y + 'px;\
						bottom:' + b + 'px;\
						left:' + x + 'px;\
						' + ((h < clmn.border) ? ('border-width:' + Math.round(h) + 'px;') : '') + '\
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
						if (step.top === Infinity) {
							avrg.top = (chart.innerHeight + zero.half);
							zero.top = (chart.innerHeight + zero.half);
						}
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
					step.x += step.left;
				}
			});


	// HTML összeállítás:
	if (avrg.css) chart.html += ('<svg style="position:absolute;width:' + chart.width + 'px;height:' + chart.height + 'px;overflow:visible;z-index:1;"><polyline points="' + avrg.points + '" class="' + chart.class + '-avg"></svg>');
	if (zero.css) chart.html += ('<svg style="position:absolute;width:' + chart.width + 'px;height:' + chart.height + 'px;overflow:visible;z-index:1;"><polyline points="' + zero.points + '" class="' + chart.class + '-zero"></svg>');
	// Integrálás:
	chart.elem.style.overflow = 'hidden';
	chart.elem.innerHTML = chart.html;

	return {
		elem	: chart.elem,
		top		: chart.top,
		left	: chart.left,
		width	: chart.width,
		height	: chart.height,
		inner	: {
			top		: sTop,
			left	: chart.left,
			bottom	: (sTop + chart.innerHeight),
			right	: (chart.left + chart.width),
			width	: chart.width,
			height	: chart.innerHeight
		},
		values	: {
			largest	 : largest.item,
			smallest : smallest.item,
			summary	 : balance,
			items	 : items
		},
		points	: {
			main : { abs: mAbs, rel: mRel },
			avg  : { abs: aAbs, rel: aRel },
			zero : { abs: zAbs, rel: zRel },
			largest	 : { abs: rAbs, rel: rRel },
			smallest : { abs: sAbs, rel: sRel }
		},
		clientOffset: chart.offset,
		pointByCursor: function(x, y) {
			let offset = chart.offset();
			x += (offset.left - chart.left);
			y += (offset.top - chart.top);
			return (((x >= 0) && (x <= chart.width) && (y >= 0) && (y <= chart.height)) ? [x, y] : false);
		},
		valueByPixel: function(pixel) {
			if (!columnOk) return 0;
			pixel -= zero.half;
			if (pixel >= chart.innerHeight) return smallest.item;
			else if (pixel <= 0) return largest.item;
			else return (((chart.innerHeight - pixel) * step.value) + smallest.item);
		},
		dataByPoint: function(x, y, l) {
			if (!columnOk) return undefined;
			if (x[1]) { l = y; y = x[1]; x = x[0] }
			if (x !== false) x = Math.round(x * 100000);
			if (y !== false) y = Math.round(y * 100000);
			let data, top, left, offset = chart.offset();
			l = Math.round((l || 10) * 10000);
			mrRel.map(function(p, i) {
				top = ((y === false) ? true : ((y >= (p[1]-l)) && (y <= (p[1]+l))));
				left = ((x === false) ? true : ((x >= (p[0]-l)) && (x <= (p[0]+l))));
				if (top && left) data = { index: i, item: items[i], summary: balance[i], rel: mRel[i], abs: [mAbs[i][0] - offset.left, mAbs[i][1] - offset.top] };
			});
			return data;
		}
	}
}
