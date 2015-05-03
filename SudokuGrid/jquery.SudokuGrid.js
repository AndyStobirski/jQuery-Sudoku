;(function($) {
    var DEFAULT_SETTINGS = {
		cellValueChange: function(pCell, pValueArray){}
		, cellSelected : function(pCell){}
		, readOnly: false
		, displayUnsolvedCells:true
    }

	// Keys "enum"
    var KEY = {
        BACKSPACE: 8,
        TAB: 9,
        ENTER: 13,
        ESCAPE: 27,
        SPACE: 32,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        END: 35,
        HOME: 36,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        NUMPAD_ENTER: 108,
        COMMA: 188,
		NUMUP:104,
		NUMDOWN:98,
		NUMLEFT:100,
		NUMRIGHT:102	
    };

	


    // Additional public (exposed) methods
    var methods = {

        //
        //	pArgs
        //
        init: function(pArgs) {

            var settings = $.extend({}, DEFAULT_SETTINGS, pArgs || {});
	
            return this.each(function() {
                $(this).data("settings", settings);
                $(this).data("SudokuGrid", new $.SudokuGrid(this, settings));
            });
        },
        reset: function() {
            return this.data("SudokuGrid").reset();
        },		
		
        redraw: function() {
            return this.data("SudokuGrid").redraw();
        },			
		
        setcellvalue: function(pCell, pValuesArray) {
            this.data("SudokuGrid").setcell(pCell, pValuesArray);
        },
		
        setcellclass: function(pCell, pClass) {
            this.data("SudokuGrid").setcellclass(pCell, pClass);
        },		
		
        clearcellclass: function(pCell) {
            this.data("SudokuGrid").clearcellclass(pCell);
        },				
		
		selectcell: function (pCell){
			this.data("SudokuGrid").selectcell(pCell);
		},
		
		getselectedcell: function (pCell){
			return this.data("SudokuGrid").getselectedcell();
		},		
								
		toggleReadOnly: function(){
			this.data("SudokuGrid").toggleReadOnly();
		},
		
		toggleDisplayUnsolvedCells: function(){			
			this.data("SudokuGrid").toggleDisplayUnsolvedCells();			
		},		
		
        destroy: function() {
            if (this.data("SudokuGrid")) {
                this.data("SudokuGrid").clear();
                var tmpInput = this;
                var closest = this.parent();
                closest.empty();
                tmpInput.show();
                closest.append(tmpInput);
                return tmpInput;
            }
        }
    };

    // Expose the .tokenInput function to jQuery as a plugin
    // Method calling and initialization logic
    $.fn.SudokuGrid = function(method) {

        if (methods[method]) {//method recognised		  
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {//constructor
            return methods.init.apply(this, arguments);
        }
    };

    //
    //	input		- original element
    //	settings	- DEFAULT_SETTINGS merged with any user provided settings
    //
    $.SudokuGrid = function(input, settings) {

	    var $source_element = $(input);
        var $container_element = null;
		var selectedCell = null;
		
		var cellArray = [];

		//Build the control - a table
		var $row;
		$container_element = $("<table/>").prop("tabindex", 1).prop("id","sudokugrid");
		
		for (y = 0; y < 9; y++){
			$row = $('<tr/>');
			for (x = 0; x <9;x++){
				$('<td/>').appendTo($row)
						  .data("coords", {X: x, Y: y})
						  .mouseup(function(e){
							e.preventDefault();		
							e.stopPropagation();							  
							  selectCell($(this).data("coords"));
						  });					  
				
			}
			$row.appendTo($container_element);
		}
					
		$source_element.after($container_element);
		$source_element.hide();

		buildArray();		
		RefreshProperties();
		
		$container_element.keyup(function(event) {
			event.preventDefault();		
			event.stopPropagation();			

			switch (event.keyCode) {

				case KEY.UP:
				case KEY.NUMUP:
					ArrowMovement(0,-1);
				break;
				
				case KEY.DOWN:
				case KEY.NUMDOWN:
					ArrowMovement(0,1);
				break;			

				case KEY.LEFT:
				case KEY.NUMLEFT:
					ArrowMovement(-1,0);
				break;			

				case KEY.RIGHT:
				case KEY.NUMRIGHT:
					ArrowMovement(1,0);
				break;			

				case KEY.TAB:
					Tab();
				break;
				
				case 48:	//values 0 - 9
				case 49:
				case 50:
				case 51:				
				case 52:								
				case 53:
				case 54:
				case 55:				
				case 56:								
				case 57:
				
					if ($(input).data("settings").readOnly)
						return;
			
					if (selectedCell != null){						
						setSelectedCellValue(selectedCell, [event.keyCode - 48]);						
						$(input).data("settings").cellValueChange (selectedCell,Cell_Get(selectedCell.X, selectedCell.Y).values);											
					}
	
				break;
			}
		}).keydown(function(event) {
			event.preventDefault();		
			event.stopPropagation();		
		});
		
		
        //</Build the control>


        //<private functions>
		
		function RefreshProperties(){
					
			if ($(input).data("settings").readOnly){		
				$container_element.addClass("readonly");
			}
			else{
				$container_element.removeClass("readonly");
			}									
			redraw();
		}
		
		
		function properties (pProperties){		            
			$(input).data("settings",  $.extend({}, DEFAULT_SETTINGS, pProperties || {}));				
			RefreshProperties();
		}
		
		
		//	
		//	Build the array cellArray, a 2d array containing an object
		//	used to manipulate with each cell and get properties about it
		//
		function buildArray(){
			
			while(cellArray.push([]) < 9);
							
			$container_element.find("td").each( function(){
				
				var $celldata = $(this).data("coords");
				
				cellArray[$celldata.X][$celldata.Y]  = 
					{
						block:getBlockValue($celldata.Y,$celldata.X)
						, X: $celldata.X
						, Y: $celldata.Y
						, element: $(this).eq(0)
						, values: []
						, setvalues : function(pValuesArray){							
							this.values = pValuesArray;																					
						}
						, addClass: function (pClass){
							var el = this.element;
							el.children().addClass(pClass);
						}
						, clearClass: function (){ //remove all but the base classes
							var el = this.element;							
							el.children().removeClass();
							
							if (el.children().length == 1){
								el.children().addClass ("cell");
							}
							else{
								el.children().addClass ("subcell");
							}
							
						}						
						, draw: function()//draw the cell based on it's values
						{																		
							var el = this.element;
							
							el.empty().removeClass();
							
							 if (this.values.length > 1 ){
							
								if ($(input).data("settings").displayUnsolvedCells){
							
								 for (i = 0; i < 9 ; i++){
									 $("<div/>").addClass("subcell")
												.appendTo(el);	
								 }
								
								 $.grep(this.values, function(value) {
									  el.children().eq(value-1).html(value);
								 });			
								}
								
							}else{

								  $("<div/>").addClass("cell")
												.html(this.values[0])
												.appendTo(el);
		
							}
													
						}
					};
				
			});
			
		}
		

		//
		//	Select the specified cell
		//
		function selectCell (pCell){
			
			if (selectedCell != null){
				CellHighlight (selectedCell, false);
			}
			selectedCell = pCell;
			CellHighlight (selectedCell, true);

		}
		
		//
		//	CellHighlight
		//
		//	Set the specifed cell's highlight state
		//
		//	pCell:	Cell in question
		//	pSelect: Is highlighted
		//
		function CellHighlight(pCell, pSelect){

			var cell = Cell_Get(pCell.X,pCell.Y);
					
			if (pSelect){
				cell.element.addClass("selected");
			}
			else{
				cell.element.removeClass("selected");
			}
		}

		//
		//	Modified the selected cell using the offset
		//
		function ArrowMovement (pX, pY)
		{				
			if (selectedCell == null){
				selectedCell = {X:0, Y:0};
			}
			else
			{
				CellHighlight (selectedCell, false);
				
				if (pX != 0 && (selectedCell.X + pX) >= 0 && (selectedCell.X + pX) < 9){
					selectedCell.X+=pX;
				}else if (pY != 0 && (selectedCell.Y + pY) >= 0 && (selectedCell.Y + pY) < 9){
					selectedCell.Y+=pY;
				}					
				
				CellHighlight (selectedCell, true);
			}
		}
		
		//
		//	Tab to the next selected cell
		//
		function Tab()
		{
			if (selectedCell == null){
				selectedCell = {X:0, Y:0};
			}
			else{
							
				CellHighlight (selectedCell, false);
				
				if (selectedCell.X == 8 && selectCell.Y == 8){
					selectedCell = {X:0, Y:0};
				}
				else if (selectedCell.X <8){
					selectedCell.X++;
				}
				else{
					selectedCell.X=0;
					selectedCell.Y = (selectedCell.Y + 1 > 8 ? 0 : selectedCell.Y + 1) ;
				}
				CellHighlight (selectedCell, true);				
			}
		}
		
		//
		//	Set the specified cell's value
		//
		//	A value of zero will toggle beween a single value 
		//
		function setSelectedCellValue (pCell, pValue ){
			
			var cell = Cell_Get(pCell.X,pCell.Y);
			
			if (pValue == 0){				
				cell.values = [1,2,3,4,5,6,7,8,9];				
			}
			else{
				cell.values = pValue;
			}
			cell.draw();	
									
		}
	
		function Cell_Get(pX, pY){
			return cellArray[pX][pY];
		}
	
		//calculate block value from row and column
		function getBlockValue(pRow, pCol) {
			return Math.floor((Math.floor(pRow / 3) * 3) + Math.floor(pCol / 3));
		}
		
		//
		//	Set the specified value to either Source or Target highlighting
		//
		//	pCell		- Cell to mark
		//	pValues		- values to mark, if null, mark all
		//	pClass		- class to use either "sourceCell" or "sourceCell"
		//
		function MarkCell(pCell, pValues, pClass){
			
			var cell = Cell_Get(pCell.X,pCell.Y);
			cell.element.removeClass("sourceCell targetCell");
			cell.element.children().removeClass("sourceCell targetCell");
			
			if (pValues == null){	//highlight entire cell
				cell.element.children().addClass(pClass);
			}
			else{
				
				console.log (cell.element);
				
				if  (
						pValues.length == 1 
						&& cell.values.length == 1
						&& el.children().eq(0).html() == pValues[0]
					){										
						cell.element.children().eq(0).addClass(pClass);
					}
					else{
						$.grep(cell.values, function(value) {
							
							if (pValues.indexOf(value) > -1){
								cell.element.children().eq(value-1).addClass(pClass);
							}															
						});												
					}							
			}
		}
		
		function reset(){			
			for (x=0;x<9;x++){
				for (y=0;y<9;y++){
					cellArray[x][y].setvalues([1,2,3,4,5,6,7,8,9]);
					cellArray[x][y].draw();
				}
			}		
		}
		
		function redraw(){			
			for (x=0;x<9;x++){
				for (y=0;y<9;y++){
					cellArray[x][y].draw();
				}
			}		
		}
		
		function setcellclass(pCell, pClass){		
			Cell_Get(pCell.X,pCell.Y).addClass(pClass);			
		}
		
		function clearcellclass (pCell){
			Cell_Get(pCell.X,pCell.Y).clearClass();
		}
		
		
        //</private functions>

        //<Public Functions>

        this.setcell = function(pCell, pValues) {			
			setSelectedCellValue(pCell, pValues);
        };
		
		this.setcellclass = function (pCell, pClass){
			setcellclass(pCell, pClass);
		}
		
		this.clearcellclass = function (pCell){
			clearcellclass(pCell);
		}
		
		this.getselectedcell = function(){
			console.log (selectedCell);
			return selectedCell;
		}
		
		
		this.toggleReadOnly = function(){			
			$(input).data("settings").readOnly = !$(input).data("settings").readOnly;		
			RefreshProperties();
		}
		
		this.toggleDisplayUnsolvedCells = function(){
			$(input).data("settings").displayUnsolvedCells = !$(input).data("settings").displayUnsolvedCells;	
			RefreshProperties();
		}
				
		this.selectcell = function (pCell){		
			selectCell (pCell);		
		}
		
		this.selectcell = function (pCell){		
			selectCell (pCell);		
		}		

		this.redraw = function(){			
			redraw();			
		};		
		
		this.reset = function(){			
			reset();			
		};
		
		this.properties = function(pProperties){
			properties(pProperties);
		}
		
        //</Public Functions>

    };

} (jQuery));