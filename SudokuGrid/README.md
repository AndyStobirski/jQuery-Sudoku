#jquery.SudokuGrid.js

This document describes the jQuery plugin jquery.SudokuGrid.js and it's accompanying css file (jquery.SudokuGrid.css).

**Configuration**

The file *SudokuGridDemo.html* contains a demo of this plugin.

**Usage**

Select a cell by clicking it, or using arrow keys to move around,or by tabbing to the next cell.

To set a cell value, click it and press 0-9, where 0 will empty the cell.

**Properties**

*readOnly* - (boolean) prevents the usage from altering the grid.

*displayUnsolvedCells* - (boolean) when false, displays an unsolved cell as being blank, else as containing the values 1 - 9 in a 3 x 3 grid.

**Methods**


**Events**

*cellValueChange* - fired when a cell's value is changed, returns the change cell's coordinate as an object '{X:x, Y:y}' and the value change as an array.

*cellSelected* - fired when a cell is selected, returns the selected cell as an object '{X:x, Y:y}'.
