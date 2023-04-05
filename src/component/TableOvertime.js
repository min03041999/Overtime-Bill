import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { Paper, Typography, Box, Divider, Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import { format } from "date-fns";
import swal from "sweetalert";

const TableOvertime = (props) => {
  const { decoded, status } = props;
  const [statusConfirm, setStatusConfirm] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [data, setData] = useState([]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  //"http://www.lacty.com.vn/overtime/data/data_overtime.php?action=queryOvertime&personID="
  //"http://192.168.18.2:8088/overtime/data/data_overtime.php?action=queryOvertime&personID="

  useEffect(() => {
    axios
      .get(
        "http://www.lacty.com.vn/overtime/data/data_overtime.php?action=queryOvertime&personID=" +
          decoded.personSerialKey
      )
      .then((res) => {
        const data = res.data;
        let array = [];
        for (let item in data) {
          array.push(data[item]);
        }
        setData(array);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [status, statusConfirm]);

  const theme = createTheme({
    palette: {
      info: {
        main: "#03a9f4",
      },
      success: {
        main: "#4caf50",
      },
      warning: {
        main: "#ff9800",
      },
      error: {
        main: "#ef5350",
      },
    },
  });

  //Confirm Cancel
  const ConfirmCancel = (serialNo) => {
    swal({
      title: "Bạn có chắc chắn?",
      text: "Muốn hủy đơn đăng ký tăng ca",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        axios
          .get(
            "http://www.lacty.com.vn/overtime/data/data_overtime.php?action=confirmCancel&serialNo=" +
              serialNo
          )
          .then((res) => {
            if (res.data.status === true) {
              setStatusConfirm(res.data.status);
              swal("Bạn đã hủy phiếu đăng kí tăng ca thành công!", {
                icon: "success",
              });
            } else {
              setStatusConfirm(res.data.status);
              swal("Error Data");
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", marginBottom: "30px" }}>
      <Box sx={{ p: 2, display: "flex" }}>
        <Typography fontWeight={700} style={{ fontSize: "18px" }}>
          Bảng thông tin tăng ca
        </Typography>
      </Box>
      <Divider />
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: "bold", minWidth: "170px" }}>
                Thời gian từ ngày
              </TableCell>
              <TableCell style={{ fontWeight: "bold", minWidth: "170px" }}>
                Thời gian đến ngày
              </TableCell>
              <TableCell style={{ fontWeight: "bold", minWidth: "150px" }}>
                Trạng thái
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item, index) => {
                //Status
                let status = "";
                switch (item[9]) {
                  case "":
                    status = (
                      <ThemeProvider theme={theme}>
                        <Button color="info" style={{ fontWeight: "bold" }}>
                          Chờ ký
                        </Button>
                      </ThemeProvider>
                    );
                    break;
                  case "0":
                    status = (
                      <ThemeProvider theme={theme}>
                        <Button color="info" style={{ fontWeight: "bold" }}>
                          Đang ký
                        </Button>
                      </ThemeProvider>
                    );
                    break;
                  case "1":
                    status = (
                      <ThemeProvider theme={theme}>
                        <Button color="success" style={{ fontWeight: "bold" }}>
                          Đã ký
                        </Button>
                      </ThemeProvider>
                    );
                    break;
                  case "2":
                    status = (
                      <ThemeProvider theme={theme}>
                        <Button color="warning" style={{ fontWeight: "bold" }}>
                          Đang hủy
                        </Button>
                      </ThemeProvider>
                    );
                    break;
                  case "3":
                    status = (
                      <ThemeProvider theme={theme}>
                        <Button color="error" style={{ fontWeight: "bold" }}>
                          Đã hủy
                        </Button>
                      </ThemeProvider>
                    );
                    break;
                  default:
                }
                //Action
                let action = false;
                switch (item[9]) {
                  case "0":
                    action = true;
                    break;
                  case "1":
                    action = true;
                    break;
                  case "2":
                    action = false;
                    break;
                  case "3":
                    action = false;
                    break;
                  default:
                }

                const format_time = (time) => {
                  const dateParts = time.split(/[/: ]/); // tách chuỗi thành mảng các phần tử

                  const year = dateParts[0];
                  const month = dateParts[1].padStart(2, "0");
                  const day = dateParts[2].padStart(2, "0");
                  const hours =
                    dateParts[3] === "下午"
                      ? parseInt(dateParts[4]) + 12
                      : parseInt(dateParts[4]); // chuyển đổi sang giờ 24h
                  const minutes = dateParts[5].padStart(2, "0");
                  const seconds = dateParts[6].padStart(2, "0");

                  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                  return formattedDateTime;
                };

                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                    <TableCell>
                      {
                        format(
                          new Date(format_time(item[6])),
                          "yyyy-MM-dd HH:mm:ss"
                        )
                          .toString()
                          .split(" ")[0]
                      }
                      &nbsp;
                      <span style={{ fontWeight: "bold" }}>
                        {
                          format(
                            new Date(format_time(item[6])),
                            "yyyy-MM-dd HH:mm:ss"
                          )
                            .toString()
                            .split(" ")[1]
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      {
                        format(
                          new Date(format_time(item[7])),
                          "yyyy-MM-dd HH:mm:ss"
                        )
                          .toString()
                          .split(" ")[0]
                      }
                      &nbsp;
                      <span style={{ fontWeight: "bold" }}>
                        {
                          format(
                            new Date(format_time(item[7])),
                            "yyyy-MM-dd HH:mm:ss"
                          )
                            .toString()
                            .split(" ")[1]
                        }
                      </span>
                    </TableCell>
                    <TableCell>{status}</TableCell>
                    <TableCell>
                      {action && (
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => ConfirmCancel(item[2])}
                        >
                          Hủy
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default TableOvertime;
