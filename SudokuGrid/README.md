#jquery.SudokuGrid.js

This document describes the jQuery plugin jquery.SudokuGrid.js and it's accompanying css file (jquery.SudokuGrid.css). A live demo is located [here](http://www.evilscience.co.uk/AndyStobirski/SudokuGrid/SudokuGridDemo.html).

**Configuration**

The file *SudokuGridDemo.html* contains a demo of this plugin.

**Usage**

Select a cell by clicking it, or using arrow keys to move around,or by tabbing to the next cell.

To set a cell value, click it and press 0-9, where 0 will empty the cell.

**Properties**

*readOnly* - (boolean) prevents the usage from altering the grid.

*displayUnsolvedCells* - (boolean) when false, displays an unsolved cell as being blank, else as containing the values 1 - 9 in a 3 x 3 grid.

**Methods**

The following methods are available:

1. *reset* - clears the Sudoku Grid. Usage: ```$("#sudokugrid").SudokuGrid("reset");```
2. *redraw* - redraws the entire Soduku Grid. Usage: ```$("#sudokugrid").SudokuGrid("redraw");```
3. *setcellvalue* (Cell, ValuesArray) - sets the specified cell to the specified value. Usage: ```$("#sudokugrid").SudokuGrid("setcellvalue", {X:5,Y:5}, [5,6,7,8]);```
4. *setcellclass* (Cell, Class) - applies the specified class to the specified cell. The class is contained in *jquery.SudokuGrid.css*. Usage:  ```$("#sudokugrid").SudokuGrid("setcellclass", "foobar");```
5. *clearcellclass* (Cell) - removes from the cell any classes applied using the method *setcellclass*. Usage: ```$("#sudokugrid").SudokuGrid("clearcellclass", {X:3,Y:2});```
6. *selectcell* (Cell) - selects the specified cell. Usage:  ```$("#sudokugrid").SudokuGrid("setcellvalue", {X:5,Y:5});```
7. *getselectedcell* - returns the currently selected cell in the form of {X:x, Y:y}. Usage:  ```$("#sudokugrid").SudokuGrid("getselectedcell");```
8. *toggleReadOnly* - toggles the sudokugrid's readonly state. ```$("#sudokugrid").SudokuGrid("toggleReadOnly");```
9. *toggleDisplayUnsolvedCells* - toggles the sudokugrid's display unsolved cell state. ```$("#sudokugrid").SudokuGrid("toggleDisplayUnsolvedCells");```

**Events**

1. *cellValueChange* - fired when a cell's value is changed, returns the change cell's coordinate as an object '{X:x, Y:y}' and the value change as an array.
2. *cellSelected* - fired when a cell is selected, returns the selected cell as an object '{X:x, Y:y}'.

Usage of above events:

```
$("#grid").SudokuGrid
	(				
		{
			cellValueChange: function(pCell,pValueArray){													
				$("#changededcell").val 
				(
					JSON.stringify(pCell)
					+ " : " 
					+ JSON.stringify(pValueArray)
				);
			}
			, cellSelected : function(pCell){										
				$("#selectedcell").val(JSON.stringify(pCell));
			}				
		}				
	);		
```