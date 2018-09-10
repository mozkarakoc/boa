module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(980);
	module.exports = __webpack_require__(980);


/***/ }),

/***/ 3:
/***/ (function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ }),

/***/ 920:
/***/ (function(module, exports) {

	module.exports = require("../kendo.core");

/***/ }),

/***/ 980:
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(f, define){
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	        __webpack_require__(920)
	    ], __WEBPACK_AMD_DEFINE_FACTORY__ = (f), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	})(function(){

	(function ($) {

	window.kendo.excel = window.kendo.excel || {};

	var getter = kendo.getter;
	var map = $.map;

	var current = {
	    compile: function(template) {
	        return template;
	    }
	};

	var TemplateService = kendo.Class.extend({

	});

	TemplateService.register = function(userImplementation) {
	    current = userImplementation;
	};

	TemplateService.compile = function(template) {
	    return current.compile(template);
	};

	function defaultGroupHeaderTemplate(data) {
	    return ((data.title) + ": " + (data.value));
	}

	function createArray(length, callback) {
	    var result = [];

	    for (var idx = 0; idx < length; idx++) {
	        result.push(callback(idx));
	    }

	    return result;
	}

	var ExcelExporter = kendo.Class.extend({
	    init: function(options) {
	        options.columns = this._trimColumns(options.columns || []);

	        this.allColumns = map(this._leafColumns(options.columns || []), this._prepareColumn);

	        this.columns = this.allColumns.filter(function(column) { return !column.hidden; });

	        this.options = options;
	        this.data = options.data || [];
	        this.aggregates = options.aggregates || {};
	        this.groups = [].concat(options.groups || []);
	        this.hierarchy = options.hierarchy;
	    },

	    workbook: function() {
	        var workbook = {
	            sheets: [ {
	                columns: this._columns(),
	                rows: this.hierarchy ? this._hierachyRows() : this._rows(),
	                freezePane: this._freezePane(),
	                filter: this._filter()
	            } ]
	        };

	        return workbook;
	    },

	    _trimColumns: function(columns) {
	        var this$1 = this;

	        return columns.filter(function (column) {
	            var result = Boolean(column.field);

	            if (!result && column.columns) {
	                result = this$1._trimColumns(column.columns).length > 0;
	            }

	            return result;
	        });
	    },

	    _leafColumns: function(columns) {
	        var this$1 = this;

	        var result = [];

	        for (var idx = 0; idx < columns.length; idx++) {
	            if (!columns[idx].columns) {
	                result.push(columns[idx]);
	            } else {
	                result = result.concat(this$1._leafColumns(columns[idx].columns));
	            }
	        }

	        return result;
	    },

	    _prepareColumn: function(column) {
	        if (!column.field) {
	            return null;
	        }

	        var value = function(dataItem) {
	            return getter(column.field)(dataItem);
	        };

	        var values = null;

	        if (column.values) {
	            values = {};

	            column.values.forEach(function(item) {
	                values[item.value] = item.text;
	            });

	            value = function(dataItem) {
	                return values[getter(column.field)(dataItem)];
	            };
	        }

	        return $.extend({}, column, {
	            value: value,
	            values: values,
	            groupHeaderTemplate: column.groupHeaderTemplate ? TemplateService.compile(column.groupHeaderTemplate) : defaultGroupHeaderTemplate,
	            groupFooterTemplate: column.groupFooterTemplate ? TemplateService.compile(column.groupFooterTemplate) : null,
	            footerTemplate: column.footerTemplate ? TemplateService.compile(column.footerTemplate) : null
	        });
	    },

	    _filter: function() {
	        if (!this.options.filterable) {
	            return null;
	        }

	        var depth = this._depth();

	        return {
	            from: depth,
	            to: depth + this.columns.length - 1
	        };
	    },

	    _createPaddingCells: function(length) {
	        var this$1 = this;

	        return createArray(length, function () { return $.extend({
	            background: "#dfdfdf",
	            color: "#333"
	        }, this$1.options.paddingCellOptions); });
	    },

	    _dataRow: function(dataItem, level, depth) {
	        var this$1 = this;

	        var cells = this._createPaddingCells(level);

	        // grouped
	        if (depth && dataItem.items) {
	            var column = this.allColumns.filter(function(column) {
	                return column.field === dataItem.field;
	            })[0];

	            var title = column && column.title ? column.title : dataItem.field;
	            var template = column ? column.groupHeaderTemplate : null;
	            var group = $.extend({
	                title: title,
	                field: dataItem.field,
	                value: column && column.values ? column.values[dataItem.value] : dataItem.value,
	                aggregates: dataItem.aggregates,
	                items: dataItem.items
	            }, dataItem.aggregates[dataItem.field]);

	            var value = title + ": " + (dataItem.value);

	            if (template) {
	                value = template(group);
	            }

	            cells.push($.extend({
	                value: value,
	                background: "#dfdfdf",
	                color: "#333",
	                colSpan: this.columns.length + depth - level
	            }, (column || {}).groupHeaderCellOptions));

	            var rows = this._dataRows(dataItem.items, level + 1);

	            rows.unshift({
	                type: "group-header",
	                cells: cells
	            });

	            return rows.concat(this._footer(dataItem));
	        }

	        var dataCells = [];

	        for (var cellIdx = 0; cellIdx < this.columns.length; cellIdx++) {
	            dataCells[cellIdx] = this$1._cell(dataItem, this$1.columns[cellIdx]);
	        }

	        if (this.hierarchy) {
	            dataCells[0].colSpan = depth - level + 1;
	        }

	        return [ {
	            type: "data",
	            cells: cells.concat(dataCells)
	        } ];
	    },

	    _dataRows: function(dataItems, level) {
	        var this$1 = this;

	        var depth = this._depth();
	        var rows = [];

	        for (var idx = 0; idx < dataItems.length; idx++) {
	            rows.push.apply(rows, this$1._dataRow(dataItems[idx], level, depth));
	        }

	        return rows;
	    },

	    _hierachyRows: function() {
	        var this$1 = this;

	        var depth = this._depth();
	        var data = this.data;
	        var itemLevel = this.hierarchy.itemLevel;
	        var hasFooter = this._hasFooterTemplate();
	        var rows = [];
	        var parents = [];
	        var previousLevel = 0;
	        var previousItemId;

	        for (var idx = 0; idx < data.length; idx++) {
	            var item = data[idx];
	            var level = itemLevel(item);

	            if (hasFooter) {
	                if (level > previousLevel) {
	                    parents.push({ id: previousItemId, level: previousLevel });
	                } else if (level < previousLevel) {
	                    rows.push.apply(rows, this$1._hierarchyFooterRows(parents, level, depth));
	                }

	                previousLevel = level;
	                previousItemId = item.id;
	            }

	            rows.push.apply(rows, this$1._dataRow(item, level + 1, depth));
	        }

	        if (hasFooter) {
	            rows.push.apply(rows, this._hierarchyFooterRows(parents, 0, depth));

	            var rootAggregate = data.length ? this.aggregates[data[0].parentId] : {};
	            rows.push(this._hierarchyFooter(rootAggregate, 0, depth));
	        }

	        this._prependHeaderRows(rows);

	        return rows;
	    },

	    _hierarchyFooterRows: function(parents, currentLevel, depth) {
	        var this$1 = this;

	        var rows = [];
	        while (parents.length && parents[parents.length - 1].level >= currentLevel) {
	            var parent = parents.pop();
	            rows.push(this$1._hierarchyFooter(this$1.aggregates[parent.id], parent.level + 1, depth));
	        }

	        return rows;
	    },

	    _hasFooterTemplate: function() {
	        var columns = this.columns;
	        for (var idx = 0; idx < columns.length; idx++) {
	            if (columns[idx].footerTemplate) {
	                return true;
	            }
	        }
	    },

	    _hierarchyFooter: function(aggregates, level, depth) {
	        var cells = this.columns.map(function(column, index) {
	            var colSpan = index ? 1 : depth - level + 1;
	            if (column.footerTemplate) {
	                return $.extend({
	                    background: "#dfdfdf",
	                    color: "#333",
	                    colSpan: colSpan,
	                    value: column.footerTemplate($.extend({}, (aggregates || {})[column.field]))
	                }, column.footerCellOptions);
	            }

	            return $.extend({
	                background: "#dfdfdf",
	                color: "#333",
	                colSpan: colSpan
	            }, column.footerCellOptions);
	        });

	        return {
	            type: "footer",
	            cells: this._createPaddingCells(level).concat(cells)
	        };
	    },

	    _footer: function(dataItem) {
	        var this$1 = this;

	        var rows = [];
	        var footer = false;

	        var cells = this.columns.map(function (column) {
	            if (column.groupFooterTemplate) {
	                var templateData = $.extend({}, this$1.aggregates, dataItem.aggregates, dataItem.aggregates[column.field], {
	                    group: {
	                        items: dataItem.items,
	                        field: dataItem.field,
	                        value: dataItem.value
	                    }
	                });

	                // https://github.com/telerik/kendo-ui-core/issues/3024
	                // https://github.com/telerik/kendo-ui-core/issues/3095
	                templateData[dataItem.field] = templateData;

	                footer = true;
	                return $.extend({
	                    background: "#dfdfdf",
	                    color: "#333",
	                    value: column.groupFooterTemplate(templateData)
	                }, column.groupFooterCellOptions);
	            }

	            return $.extend({
	                background: "#dfdfdf",
	                color: "#333"
	            }, column.groupFooterCellOptions);
	        });

	        if (footer) {
	            rows.push({
	                type: "group-footer",
	                cells: this._createPaddingCells(this.groups.length).concat(cells)
	            });
	        }

	        return rows;
	    },

	    _isColumnVisible: function(column) {
	        return this._visibleColumns([ column ]).length > 0 && (column.field || column.columns);
	    },

	    _visibleColumns: function(columns) {
	        var this$1 = this;

	        return columns.filter(function (column) {
	            var result = !column.hidden;
	            if (result && column.columns) {
	                result = this$1._visibleColumns(column.columns).length > 0;
	            }
	            return result;
	        });
	    },

	    _headerRow: function(row, groups) {
	        var this$1 = this;

	        var headers = row.cells.map(function(cell) {
	            return $.extend(cell, {
	                colSpan: cell.colSpan > 1 ? cell.colSpan : 1,
	                rowSpan: row.rowSpan > 1 && !cell.colSpan ? row.rowSpan : 1
	            });
	        });

	        if (this.hierarchy) {
	            headers[0].colSpan = this._depth() + 1;
	        }

	        return {
	            type: "header",
	            cells: createArray(groups.length, function () { return $.extend({
	                background: "#7a7a7a",
	                color: "#fff"
	            }, this$1.options.headerPaddingCellOptions); }).concat(headers)
	        };
	    },

	    _prependHeaderRows: function(rows) {
	        var this$1 = this;

	        var groups = this.groups;

	        var headerRows = [ { rowSpan: 1, cells: [], index: 0 } ];

	        this._prepareHeaderRows(headerRows, this.options.columns);

	        for (var idx = headerRows.length - 1; idx >= 0; idx--) {
	            rows.unshift(this$1._headerRow(headerRows[idx], groups));
	        }
	    },

	    _prepareHeaderRows: function(rows, columns, parentCell, parentRow) {
	        var this$1 = this;

	        var row = parentRow || rows[rows.length - 1];
	        var childRow = rows[row.index + 1];
	        var totalColSpan = 0;

	        for (var idx = 0; idx < columns.length; idx++) {
	            var column = columns[idx];
	            if (this$1._isColumnVisible(column)) {

	                var cell = $.extend({
	                    background: "#7a7a7a",
	                    color: "#fff",
	                    value: column.title || column.field,
	                    colSpan: 0
	                }, column.headerCellOptions);
	                row.cells.push(cell);

	                if (column.columns && column.columns.length) {
	                    if (!childRow) {
	                        childRow = { rowSpan: 0, cells: [], index: rows.length };
	                        rows.push(childRow);
	                    }
	                    cell.colSpan = this$1._trimColumns(this$1._visibleColumns(column.columns)).length;
	                    this$1._prepareHeaderRows(rows, column.columns, cell, childRow);
	                    totalColSpan += cell.colSpan - 1;
	                    row.rowSpan = rows.length - row.index;
	                }
	            }
	        }

	        if (parentCell) {
	            parentCell.colSpan += totalColSpan;
	        }
	    },

	    _rows: function() {
	        var this$1 = this;

	        var rows = this._dataRows(this.data, 0);

	        if (this.columns.length) {
	            this._prependHeaderRows(rows);
	            var footer = false;

	            var cells = this.columns.map(function (column) {
	                if (column.footerTemplate) {
	                    footer = true;

	                    return $.extend({
	                        background: "#dfdfdf",
	                        color: "#333",
	                        value: column.footerTemplate($.extend({}, this$1.aggregates, this$1.aggregates[column.field]))
	                    }, column.footerCellOptions);
	                }

	                return $.extend({
	                    background: "#dfdfdf",
	                    color: "#333"
	                }, column.footerCellOptions);
	            });

	            if (footer) {
	                rows.push({
	                    type: "footer",
	                    cells: this._createPaddingCells(this.groups.length).concat(cells)
	                });
	            }
	        }

	        return rows;
	    },

	    _headerDepth: function(columns) {
	        var this$1 = this;

	        var result = 1;
	        var max = 0;

	        for (var idx = 0; idx < columns.length; idx++) {
	            if (columns[idx].columns) {
	                var temp = this$1._headerDepth(columns[idx].columns);
	                if (temp > max) {
	                    max = temp;
	                }
	            }
	        }
	        return result + max;
	    },

	    _freezePane: function() {
	        var columns = this._visibleColumns(this.options.columns || []);

	        var colSplit = this._visibleColumns(this._trimColumns(this._leafColumns(columns.filter(function(column) {
	            return column.locked;
	        })))).length;

	        return {
	            rowSplit: this._headerDepth(columns),
	            colSplit: colSplit ? colSplit + this.groups.length : 0
	        };
	    },

	    _cell: function(dataItem, column) {
	        return $.extend({
	            value: column.value(dataItem)
	        }, column.cellOptions);
	    },

	    _depth: function() {
	        var depth = 0;

	        if (this.hierarchy) {
	            depth = this.hierarchy.depth;
	        } else {
	            depth = this.groups.length;
	        }

	        return depth;
	    },

	    _columns: function() {
	        var depth = this._depth();
	        var columns = createArray(depth, function () { return ({ width: 20 }); });

	        return columns.concat(this.columns.map(function(column) {
	            return {
	                width: parseInt(column.width, 10),
	                autoWidth: column.width ? false : true
	            };
	        }));
	    }
	});

	kendo.deepExtend(kendo.excel, {
	    ExcelExporter: ExcelExporter,
	    TemplateService: TemplateService
	});

	})(window.kendo.jQuery);

	}, __webpack_require__(3));

/***/ })

/******/ });