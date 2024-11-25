import { useState } from 'react';
import { TextField, InputAdornment, Paper } from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'

const Component_SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (e) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        onSearch(newSearchTerm);
    };

    return (
        <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Searching items..."
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{
                    mb: 0,
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                            borderColor: "#1976d2",
                        },
                    },
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" />
                        </InputAdornment>
                    ),
                }}
            />
        </Paper>
    )
}

export default Component_SearchBar;