import React, { useState } from "react";
import {
  CssBaseline,
  Container,
  Card,
  Divider,
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Alert,
  AlertTitle,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useFormik } from "formik";
import * as Yup from "yup";
import { format } from "date-fns";

import axios from "axios";
import jwt_decode from "jwt-decode";

import { useLocation } from "react-router-dom";

const Overtime = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const param_key = searchParams.get("key");
  const decoded = jwt_decode("t." + param_key + ".t");

  const [status, setStatus] = useState(false);

  const validationSchema = Yup.object().shape({
    ID: Yup.string().required("Vui lòng nhập số thẻ!"),
    Name: Yup.string().required("Vui lòng nhập tên!"),
    Dept: Yup.string().required("Vui lòng nhập đơn vị!"),
    Date_From: Yup.string().required("Vui lòng nhập từ ngày tăng ca!"),
    Date_To: Yup.string().required("Vui lòng nhập đến ngày tăng ca!"),
    Time_Start: Yup.string().required("Vui lòng nhập thời gian bắt đầu!"),
    Time_End: Yup.string().required("Vui lòng nhập thời gian kết thúc!"),
  });

  const validate = (values) => {
    const errors = {};
    if (
      format(values.Date_From.$d, "yyyy-MM-dd") &&
      format(values.Date_To.$d, "yyyy-MM-dd") &&
      format(values.Date_From.$d, "yyyy-MM-dd") >
        format(values.Date_To.$d, "yyyy-MM-dd")
    ) {
      errors.Date_To = "Ngày kết thúc không được trước ngày bắt đầu!";
    }

    if (values.Time_End !== null) {
      if (
        format(values.Time_Start.$d, "HH:mm") &&
        format(values.Time_End.$d, "HH:mm") &&
        format(values.Time_Start.$d, "HH:mm") >
          format(values.Time_End.$d, "HH:mm") &&
        format(values.Date_From.$d, "yyyy-MM-dd") >=
          format(values.Date_To.$d, "yyyy-MM-dd")
      ) {
        errors.Time_End = "Giờ kết thúc không được trước giờ bắt đầu!";
      }
    }

    return errors;
  };

  const formik = useFormik({
    initialValues: {
      ID: decoded.personId,
      Name: decoded.fullName,
      Dept: decoded.department,
      Date_From: dayjs(new Date()),
      Date_To: dayjs(new Date()),
      Time_Start: dayjs().set("hour", 16).set("minute", 30).set("second", 0),
      Time_End: null,
      Remark: "",
    },
    validationSchema,
    validate,
    onSubmit: (data) => {
      let payload = {
        ID: data.ID,
        Name: data.Name,
        Dept: data.Dept,
        Date_From: format(data.Date_From.$d, "yyyy-MM-dd"),
        Date_To: format(data.Date_To.$d, "yyyy-MM-dd"),
        Time_Start: format(data.Time_Start.$d, "HH:mm"),
        Time_End: format(data.Time_End.$d, "HH:mm"),
        Remark: data.Remark,
      };

      axios
        .post(
          "http://www.lacty.com.vn/overtime/data/data_overtime.php?action=addOvertime",
          JSON.stringify(payload)
        )
        .then((res) => {
          console.log(res.data);
          if (res.data.status === true) {
            setStatus(true);
          } else {
            setStatus(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
  });

  return (
    <React.Fragment>
      <CssBaseline />
      <Container fixed>
        <h1 style={{ color: "#0056c1", textAlign: "center" }}>
          PHIẾU ĐĂNG KÝ TĂNG CA
        </h1>
        <Typography fontWeight={700}>
          Ghi chú: Phiếu này cần lập biểu trước ít nhất 01 ngày.
        </Typography>
        <Typography fontWeight={400}>
          - Lao động nữ có thai từ tuần thứ 25, đang nuôi con dưới 12 tháng
          tuổi, lao động dưới 18 tuổi không được phép tăng ca.
        </Typography>
        <Typography fontWeight={400}>
          Lưu ý: Lao động nữ đang nuôi con dưới 12 tháng tuổi chỉ được tăng ca
          khi công ty có nhu cầu và NLĐ đồng ý làm thêm giờ.
        </Typography>
        <Typography fontWeight={400}>
          - NLĐ tăng ca: không quá 4h/ngày, không quá 12h/tuần, không quá
          30h/tháng hoặc không quá 40h/tháng (40h/tháng chỉ áp dụng cho những
          đơn vị được phép tăng ca theo thông báo số 24TB/LT.21), không quá
          300h/năm.
        </Typography>
        <Typography fontWeight={400}>
          - Lũy kế tăng ca tuần = số giờ đã tăng ca trong tuần + số giờ tăng ca
          ngày lập biểu.
        </Typography>
        <Typography fontWeight={400}>
          - Lũy kế tăng ca tháng = số giờ đã tăng ca trong tháng + số giờ tăng
          ca ngày lập biểu.
        </Typography>

        {status === false ? (
          <Card sx={{ marginTop: "30px" }}>
            <Box sx={{ p: 2, display: "flex" }}>
              <Typography fontWeight={700} style={{ fontSize: "18px" }}>
                Nội dung đề nghị
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ p: 2 }} component="form" onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Số thẻ"
                    name="ID"
                    className={
                      formik.errors.ID && formik.touched.ID ? "is-invalid" : ""
                    }
                    error={formik.errors.ID && formik.touched.ID === true}
                    helperText={
                      formik.errors.ID && formik.touched.ID
                        ? formik.errors.ID
                        : null
                    }
                    onChange={formik.handleChange}
                    value={formik.values.ID}
                    inputProps={{ readOnly: true }}
                  />
                  {/* <div className="invalid-feedback">
                      {formik.errors.ID && formik.touched.ID
                        ? formik.errors.ID
                        : null}
                    </div> */}
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Họ tên"
                    name="Name"
                    className={
                      formik.errors.Name && formik.touched.Name
                        ? " is-invalid"
                        : ""
                    }
                    error={formik.errors.Name && formik.touched.Name === true}
                    helperText={
                      formik.errors.Name && formik.touched.Name
                        ? formik.errors.Name
                        : null
                    }
                    onChange={formik.handleChange}
                    value={formik.values.Name}
                    inputProps={{ readOnly: true }}
                  />
                  {/* <div className="invalid-feedback">
                      {formik.errors.Name && formik.touched.Name
                        ? formik.errors.Name
                        : null}
                    </div> */}
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Đơn vị"
                    name="Dept"
                    className={
                      formik.errors.Dept && formik.touched.Dept
                        ? " is-invalid"
                        : ""
                    }
                    error={formik.errors.Dept && formik.touched.Dept === true}
                    helperText={
                      formik.errors.Dept && formik.touched.Dept
                        ? formik.errors.Dept
                        : null
                    }
                    onChange={formik.handleChange}
                    value={formik.values.Dept}
                    inputProps={{ readOnly: true }}
                  />
                  {/* <div className="invalid-feedback">
                      {formik.errors.Dept && formik.touched.Dept
                        ? formik.errors.Dept
                        : null}
                    </div> */}
                </Grid>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Tăng ca từ ngày"
                      format="DD-MM-YYYY"
                      id="Date_From"
                      name="Date_From"
                      sx={{ width: "100%" }}
                      value={formik.values.Date_From}
                      onChange={(value) => {
                        formik.setFieldValue("Date_From", value);
                      }}
                      className={
                        formik.errors.Date_From && formik.touched.Date_From
                          ? " is-invalid"
                          : ""
                      }
                      slotProps={{
                        textField: {
                          helperText:
                            formik.touched.DateFrom && formik.errors.DateFrom,
                          error:
                            formik.touched.DateFrom &&
                            Boolean(formik.errors.DateFrom),
                        },
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.Date_From && formik.touched.Date_From
                        ? formik.errors.Date_From
                        : null}
                    </div>
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Tăng ca đến ngày"
                      id="Date_To"
                      name="Date_To"
                      format="DD-MM-YYYY"
                      sx={{ width: "100%" }}
                      value={formik.values.Date_To}
                      onChange={(value) => {
                        formik.setFieldValue("Date_To", value);
                      }}
                      className={
                        formik.errors.Date_To && formik.touched.Date_To
                          ? " is-invalid"
                          : ""
                      }
                      defaultValue={dayjs(new Date())}
                      slotProps={{
                        textField: {
                          helperText:
                            formik.touched.Date_To && formik.errors.Date_To,
                          error:
                            formik.touched.Date_To &&
                            Boolean(formik.errors.Date_To),
                        },
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                    {/* <div className="invalid-feedback">
                        {formik.errors.Date_To && formik.touched.Date_To
                          ? formik.errors.Date_To
                          : null}
                      </div> */}
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="Giờ bắt đầu"
                      id="Time_Start"
                      name="Time_Start"
                      format="HH:mm"
                      sx={{ width: "100%" }}
                      value={formik.values.Time_Start}
                      onChange={(value) => {
                        formik.setFieldValue("Time_Start", value);
                      }}
                      className={
                        formik.errors.Time_Start && formik.touched.Time_Start
                          ? " is-invalid"
                          : ""
                      }
                      slotProps={{
                        textField: {
                          helperText:
                            formik.touched.Time_Start &&
                            formik.errors.Time_Start,
                          error:
                            formik.touched.Time_Start &&
                            Boolean(formik.errors.Time_Start),
                        },
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="Giờ kết thúc"
                      id="Time_End"
                      name="Time_End"
                      format="HH:mm"
                      sx={{ width: "100%" }}
                      value={formik.values.Time_End}
                      onChange={(value) => {
                        formik.setFieldValue("Time_End", value);
                      }}
                      className={
                        formik.errors.Time_End && formik.touched.Time_End
                          ? " is-invalid"
                          : ""
                      }
                      slotProps={{
                        textField: {
                          helperText:
                            formik.touched.Time_End && formik.errors.Time_End,
                          error:
                            formik.touched.Time_End &&
                            Boolean(formik.errors.Time_End),
                        },
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                    {/* <div className="invalid-feedback">
                        {formik.errors.Time_End && formik.touched.Time_End
                          ? formik.errors.Time_End
                          : null}
                      </div> */}
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    name="Remark"
                    id="Remark"
                    label="Lý do"
                    multiline
                    rows={4}
                    fullWidth
                    className={
                      formik.errors.Remark && formik.touched.Remark
                        ? "is-invalid"
                        : ""
                    }
                    onChange={formik.handleChange}
                    value={formik.values.Remark}
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                variant="contained"
                sx={{ marginTop: "20px" }}
              >
                Send
              </Button>
            </Box>
          </Card>
        ) : (
          <div style={{ marginTop: "30px" }}>
            <Alert severity="success">
              <AlertTitle>
                <strong>Success</strong>
              </AlertTitle>
              Bạn đã đăng kí tăng ca thành công!
            </Alert>
          </div>
        )}
      </Container>
    </React.Fragment>
  );
};

export default Overtime;
