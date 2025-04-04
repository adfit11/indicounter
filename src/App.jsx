import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from './components/ui/dialog';

// Define the rows and sections for the table
const rows = ['Q1', 'Q2', 'Q3', 'Q4'];
const sections = ['Stat A', 'Stat B', 'Stat C', 'Stat D', 'Stat E', 'Stat F', 'Stat G', 'Stat H', 'Stat I'];

const pastelColors = [
  { name: 'Pink', value: '#FFEBEE' },
  { name: 'Peach', value: '#FFF3E0' },
  { name: 'Lemon', value: '#FFFDE7' },
  { name: 'Mint', value: '#E8F5E9' },
  { name: 'Sky', value: '#E3F2FD' },
  { name: 'Lavender', value: '#F3E5F5' },
  { name: 'Aqua', value: '#E0F7FA' },
  { name: 'Coral', value: '#FBE9E7' },
];

// Initialize titles for each section
const initialTitles = Object.fromEntries(sections.map(section => [section, section]));

export default function App() {
  // State to track the selected row
  const [selectedRow, setSelectedRow] = useState('B');

  // State to manage the data for each section and row
  const [data, setData] = useState(() => {
    try {
      // Load saved data from localStorage or initialize empty structure
      const saved = JSON.parse(localStorage.getItem('counter-data')) || {};
      return sections.reduce((acc, section) => {
        acc[section] = rows.reduce((rAcc, row) => {
          rAcc[row] = Array.isArray(saved?.[section]?.[row]) ? saved[section][row] : [];
          return rAcc;
        }, {});
        return acc;
      }, {});
    } catch {
      return {};
    }
  });

  // State to manage titles for each section
  const [titles, setTitles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('counter-titles')) || initialTitles;
    } catch {
      return initialTitles;
    }
  });

  // State to manage dialog visibility
  const [dialogOpen, setDialogOpen] = useState(false);

  // State to manage input value in the dialog
  const [inputValue, setInputValue] = useState('');

  // State to track the currently active section for adding data
  const [activeSection, setActiveSection] = useState(null);

  // state to track table colours
  const [sectionColors, setSectionColors] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("counter-section-colors")) || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("counter-section-colors", JSON.stringify(sectionColors));
  }, [sectionColors]);


  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('counter-data', JSON.stringify(data));
  }, [data]);

  // Function to add a value to the selected section and row
  const handleAdd = (value) => {
    if (!isNaN(value) && activeSection) {
      setData((prev) => {
        const copy = { ...prev };
        copy[activeSection][selectedRow] = [...copy[activeSection][selectedRow], value];
        return copy;
      });
      setInputValue('');
      setDialogOpen(false);
    }
  };

  // Function to remove a value from a specific section, row, and index
  const handleRemove = (section, row, index) => {
    setData((prev) => {
      const copy = { ...prev };
      copy[section][row] = copy[section][row].filter((_, i) => i !== index);
      return copy;
    });
  };

  // Function to export data as a CSV file
  const handleExport = () => {
    const rowsOut = ["Section,Row,Index,Value"];
    sections.forEach(section => {
      rows.forEach(row => {
        data[section][row].forEach((val, i) => {
          rowsOut.push(`${section},${row},${i + 1},${val}`);
        });
      });
    });
    const blob = new Blob([rowsOut.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'counter-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Function to clear all data after user confirmation
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      if (window.confirm("This will remove all entries in all tables. Confirm again to proceed.")) {
        const cleared = sections.reduce((acc, section) => {
          acc[section] = rows.reduce((rAcc, row) => {
            rAcc[row] = [];
            return rAcc;
          }, {});
          return acc;
        }, {});

        setData(cleared);
        localStorage.setItem("counter-data", JSON.stringify(cleared));

      }
    }
  };

  // Function to get unique and sorted values from all sections and rows
  const getUniqueSortedValues = () => {
    const values = new Set();
    sections.forEach(s => rows.forEach(r => data[s][r].forEach(v => values.add(v))));
    return Array.from(values).sort((a, b) => a - b);
  };

  return (
    <div className="p-4 max-w-full mx-auto">
      {/* Row selection buttons */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {rows.map(row => (
          <Button key={row} onClick={() => setSelectedRow(row)} className={selectedRow === row ? 'bg-red-500' : ''}>
            {row}
          </Button>
        ))}
      </div>

      {/* Section tables */}
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-2 gap-4">
        {sections.map(section => (
          <div
            key={section}
            className="mb-2 p-2 rounded"
            style={{ backgroundColor: sectionColors[section] || '#ffffff' }}
          >

            {/* Editable section title + ADD button side-by-side */}
            <div className="flex items-center gap-2 mb-2">
              <Input
                value={titles[section]}
                onChange={(e) => {
                  const newTitles = { ...titles, [section]: e.target.value };
                  setTitles(newTitles);
                  localStorage.setItem("counter-titles", JSON.stringify(newTitles));
                }}
                className="text-md font-bold border-b"
              />

              <select
                value={sectionColors[section] || ''}
                onChange={(e) =>
                  setSectionColors({ ...sectionColors, [section]: e.target.value })
                }
                className="border rounded px-2 py-1 text-sm w-24"
                title="Select background color"
              >
                <option value="">No Color</option>
                {pastelColors.map(({ name, value }) => (
                  <option key={value} value={value}>
                    {name}
                  </option>
                ))}
              </select>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => setActiveSection(section)}
                    className="bg-cyan-400 whitespace-nowrap w-40"
                  >
                    ADD
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Add number to {section} - Row {selectedRow}</DialogTitle>
                  <Input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter number"
                  />
                  <div className="flex flex-wrap gap-2 mt-4">
                    {getUniqueSortedValues().map(val => (
                      <Button key={val} variant="outline" onClick={() => handleAdd(val)}>
                        {val}
                      </Button>
                    ))}
                  </div>
                  <Button className="mt-4 w-full" onClick={() => handleAdd(parseInt(inputValue))}>Confirm</Button>
                </DialogContent>
              </Dialog>
            </div>




            {/* Data table */}
            <div className="overflow-x-auto text-sm">
              <table className="w-full table-fixed border border-black bg-white">
                {/* <thead>
                  <tr>
                    <th className="border">&nbsp;</th>
                    {[...Array(20)].map((_, i) => (
                      <th key={i} className="border text-center">{i + 1}</th>
                    ))}
                    <th className="border">Count</th>
                  </tr> 
                </thead> */}
                <tbody>
                  {rows.map(row => (
                    <tr key={row}>
                      <td className="border text-center font-bold text-xs">{row}</td>
                      {[...Array(20)].map((_, i) => (
                        <td
                          key={i}
                          className="border text-center cursor-pointer text-xs"
                          onClick={() => handleRemove(section, row, i)}
                        >
                          {data[section][row][i] ?? ''}
                        </td>
                      ))}
                      <td className="border bg-green-100 text-center">{data[section][row].length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


          </div>
        ))}
      </div>

      {/* Export and Clear All buttons */}
      <div>
        <Button onClick={handleExport} className="col-span-2 mt-2">Export Data</Button> &nbsp;
        <Button onClick={handleClearAll} className="col-span-2 mt-2 bg-red-600 hover:bg-red-700">Clear All</Button>
      </div>
    </div>
  );
}