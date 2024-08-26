import { Snackbar, Alert } from '@mui/material';

const MySnackbar = ({ open, message, severity, onClose }) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={onClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                sx={{ width: "100%" }}
                elevation={6}
                variant="filled"
            >
                {message}
            </Alert>
        </Snackbar>
    )
}

export default MySnackbar;