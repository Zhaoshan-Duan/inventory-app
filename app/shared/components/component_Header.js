import { AppBar, Toolbar, Typography, Button } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

export default function Component_Header({ onAddClick }) {
    return (
        <AppBar position="static" sx={{ bgcolor: "#1976d2" }}>
            <Toolbar>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ flexGrow: 1, fontWeight: "bold", letterSpacing: 1 }}
                >
                    🥘 Inventory
                </Typography>
                <Button
                    color="inherit"
                    onClick={onAddClick}
                    startIcon={<AddIcon />}
                    sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                        borderRadius: 2,
                        px: 2,
                    }}
                >
                    Add New Item
                </Button>
            </Toolbar>
        </AppBar>
    )
}