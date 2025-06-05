import { useMemo, useState } from "react";

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { getComparator } from "../utils";

const CustomTableComponent = ({
  players,
  headCells,
  initialOrderBy,
}) => {
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

  return (
    <Paper sx={{ width: "100%", overflow: "scroll" }} elevation={0}>
      <TableContainer
        sx={{
          backgroundColor: "white",
          maxHeight: '95vh'
        }}
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
    </Paper>
  );
};

export default CustomTableComponent;
