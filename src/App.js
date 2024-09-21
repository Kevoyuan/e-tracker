import React, { useState, useEffect } from 'react';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Button,
  Typography,
  Autocomplete,
} from '@mui/material';
import { AddCircle, Delete } from '@mui/icons-material';
import { DatePicker } from '@mui/lab'; // Make sure to install @mui/lab for DatePicker
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [projectSuggestions, setProjectSuggestions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // State for selected date

  useEffect(() => {
    // Load saved expenses and project suggestions from local storage
    const savedExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const savedSuggestions = JSON.parse(localStorage.getItem('projectSuggestions')) || [];
    setExpenses(savedExpenses);
    setProjectSuggestions(savedSuggestions);
  }, []);

  useEffect(() => {
    // Save expenses and project suggestions to local storage
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('projectSuggestions', JSON.stringify(projectSuggestions));
  }, [expenses, projectSuggestions]);

  const handleInputChange = (index, field, value) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index][field] = value;

    if (field === 'project' && value && !projectSuggestions.includes(value)) {
      setProjectSuggestions([...projectSuggestions, value]);
    }

    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = parseFloat(updatedExpenses[index].quantity) || 0;
      const unitPrice = parseFloat(updatedExpenses[index].unitPrice) || 0;
      updatedExpenses[index].totalPrice = (quantity * unitPrice).toFixed(2);
    }

    setExpenses(updatedExpenses);
  };

  const handleProjectChange = (index, newValue) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index].project = newValue;
    setExpenses(updatedExpenses);

    if (newValue && !projectSuggestions.includes(newValue)) {
      setProjectSuggestions([...projectSuggestions, newValue]);
    }
  };

  const addNewExpense = () => {
    setExpenses([
      ...expenses,
      { project: '', quantity: '', unitPrice: '', totalPrice: '0.00', actualPaid: '' },
    ]);
  };

  const deleteExpense = (index) => {
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(updatedExpenses);
  };

  const calculateTotal = (field) => {
    return expenses
      .reduce((sum, expense) => {
        const value = field === 'actualPaid' && expense[field] === '' ? parseFloat(expense.totalPrice) : parseFloat(expense[field]) || 0;
        return sum + value;
      }, 0)
      .toFixed(2);
  };

  // Function to export the table data to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(expenses); // Convert expenses data to worksheet
    const workbook = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses'); // Append the worksheet

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    saveAs(blob, `Expenses_${selectedDate.toLocaleDateString()}.xlsx`); // Use the selected date for file name
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      {/* Title and Date Picker section */}
      <Typography variant="h4" gutterBottom align="center">
        购物清单🛍️
      </Typography>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <DatePicker
          label="选择日期"
          value={selectedDate}
          onChange={(newDate) => setSelectedDate(newDate)}
          renderInput={(params) => <TextField {...params} />}
        />
        <Button variant="contained" color="secondary" onClick={exportToExcel}>
          导出为Excel
        </Button>
      </div>

      {/* Existing TableContainer code */}
      <TableContainer component={Paper} elevation={3}>
        <Table aria-label="expense table">
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '30%' }}>项目</TableCell>
              <TableCell style={{ width: '15%' }} align="right">数量</TableCell>
              <TableCell style={{ width: '15%' }} align="right">单价</TableCell>
              <TableCell style={{ width: '15%' }} align="right">总价</TableCell>
              <TableCell style={{ width: '15%' }} align="right">实付</TableCell>
              <TableCell style={{ width: '10%' }} align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense, index) => (
              <TableRow key={index} hover>
                <TableCell style={{ width: '30%' }}>
                  <Autocomplete
                    freeSolo
                    options={projectSuggestions}
                    value={expense.project}
                    onChange={(event, newValue) => handleProjectChange(index, newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        fullWidth
                        placeholder="选择或输入项目"
                      />
                    )}
                  />
                </TableCell>
                <TableCell style={{ width: '15%' }} align="right">
                  <TextField
                    type="number"
                    value={expense.quantity}
                    onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                    variant="outlined"
                    size="small"
                    inputProps={{ min: 0 }}
                    fullWidth
                  />
                </TableCell>
                <TableCell style={{ width: '15%' }} align="right">
                  <TextField
                    type="number"
                    value={expense.unitPrice}
                    onChange={(e) => handleInputChange(index, 'unitPrice', e.target.value)}
                    variant="outlined"
                    size="small"
                    inputProps={{ min: 0, step: '0.01' }}
                    fullWidth
                  />
                </TableCell>
                <TableCell style={{ width: '15%' }} align="right">
                  <Typography variant="body1">{parseFloat(expense.totalPrice).toFixed(2)}</Typography>
                </TableCell>
                <TableCell style={{ width: '15%' }} align="right">
                  <TextField
                    type="number"
                    value={expense.actualPaid}
                    onChange={(e) => handleInputChange(index, 'actualPaid', e.target.value)}
                    variant="outlined"
                    size="small"
                    inputProps={{ min: 0, step: '0.01' }}
                    placeholder={expense.totalPrice}
                    fullWidth
                  />
                </TableCell>
                <TableCell style={{ width: '10%' }} align="center">
                  <IconButton color="error" onClick={() => deleteExpense(index)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddCircle />}
                  onClick={addNewExpense}
                  style={{ marginTop: '1rem' }}
                >
                  添加新项目
                </Button>
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6">总计</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6">{calculateTotal('actualPaid')}</Typography>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ExpenseTracker;
