import React, { useMemo, useRef, useState } from "react";

import {
  Box,
  Fab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { visuallyHidden } from "@mui/utils";
import { toPng } from "html-to-image";

const CustomTableComponent = ({
  getComparator,
  players,
  headCells,
  initialOrderBy,
  title = "mejengas",
}) => {
  const tableRef = useRef(null);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState(initialOrderBy);

  const visibleRows = useMemo(
    () => [...players].sort(getComparator(order, orderBy)),
    [order, orderBy, players]
  );

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const createSortHandler = (property) => (event) => {
    handleRequestSort(event, property);
  };

  const handleExport = async () => {
    if (tableRef.current) {
      try {
        const dataUrl = await toPng(tableRef.current);
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = title + ".png";
        link.click();
      } catch (error) {
        console.error("Error al exportar la tabla como imagen:", error);
      }
    }
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer
        sx={{ maxHeight: "85vh", backgroundColor: "white" }}
        ref={tableRef}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                  align={headCell.align}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : "asc"}
                    onClick={createSortHandler(headCell.id)}
                    hideSortIcon={orderBy !== headCell.id}
                  >
                    {headCell.icon ? headCell.icon : headCell.label}
                    {orderBy === headCell.id ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === "desc"
                          ? "sorted descending"
                          : "sorted ascending"}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((player) => {
              return (
                <TableRow key={player.id}>
                  {headCells.map((headCell) => (
                    <TableCell key={headCell.id} align={headCell.align}>
                      {player[headCell.id]}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "absolute", bottom: 15, right: 15 }}
        onClick={handleExport}
      >
        <DownloadIcon />
      </Fab>
    </Paper>
  );
};

export default CustomTableComponent;
