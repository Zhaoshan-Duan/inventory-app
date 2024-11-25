import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    Chip,
    IconButton,
    Collapse,
    List,
    ListItem,
    ListItemText,
    styled,
} from '@mui/material'
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'

import { useState, forwardRef } from 'react';

const QuantityDisplay = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: "50%",
    width: 40,
    height: 40,
    fontWeight: "bold",
    fontSize: "1.2rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
}));

const Component_InventoryItemCard = forwardRef(({
    item,
    onUpdateQuantity,
    onAcceptClassifiedName }, ref) => {
        console.log("Item received in Component_InventoryItemCard:", item);


    const [expanded, setExpanded] = useState(false)

    const toggleExpand = () => setExpanded(!expanded)

    const renderCategories = () => {
        console.log("Categories:", item.categories);
        if (!item.categories) {
            return <p>No categories available</p>;
        }
        if (typeof item.categories === 'string') {
            return <Chip label={item.categories} size="small" />;
        }
        if (Array.isArray(item.categories)) {
            return item.categories.map((category, index) => (
                <Chip
                    key={`${item.id}-category-${index}`}
                    label={category}
                    size="small"
                    sx={{ bgcolor: "#e3f2fd", color: "#1976d2" }}
                />
            ));
        }
        return <p>Invalid category format</p>;
    };

    return (
        <Card
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "0.3s",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                },
            }}
        >
            {item.imageUrl ? (
                <Box
                    sx={{
                        height: 200,
                        backgroundImage: `url(${item.imageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
            ) : (
                <Box
                    sx={{
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#e0e0e0",
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        No image available
                    </Typography>
                </Box>
            )}

            <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                    }}
                >
                    <Typography
                        variant="h5"
                        component="div"
                        gutterBottom
                        fontWeight="bold"
                    >
                        {item.userEnteredName}
                    </Typography>
                    <QuantityDisplay sx={{ mt: 2 }}>
                        {item.quantity}
                    </QuantityDisplay>
                </Box>

                {item.classifiedName &&
                    item.classifiedName !== item.userEnteredName && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 1,
                                mb: 2,
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Detected Name: {item.classifiedName}
                            </Typography>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => onAcceptClassifiedName(item.id, item.classifiedName)}
                                sx={{ ml: 2 }}
                            >
                                Use Detected Name
                            </Button>
                        </Box>
                    )}

                {item.categories && item.categories.length > 0 && (
                    <Box
                        sx={{
                            mt: 2,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                        }}
                    >
                         {renderCategories()}
                    </Box>
                )}

                <Button
                    onClick={toggleExpand}
                    startIcon={
                        expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                    sx={{ mt: 2, textTransform: "none" }}
                >
                    {expanded ? "Less Info" : "More Info"}
                </Button>

                <Collapse
                    in={expanded}
                    timeout="auto"
                    unmountOnExit
                >
                    <List dense>

                        {item.unit && (
                            <ListItem key={`${item.id}-unit`}>
                                <ListItemText primary="Unit" secondary={item.unit} />
                            </ListItem>
                        )}
                        {item.ingredients && item.ingredients.length > 0 && (
                            <ListItem key={`${item.id}-ingredients`}>
                                <ListItemText
                                    primary="Ingredients"
                                    secondary={item.ingredients.join(", ")}
                                />
                            </ListItem>
                        )}
                        {item.culinaryUses && (
                            <ListItem key={`${item.id}-culinary-uses`}>
                                <ListItemText primary="Culinary Uses" secondary={item.culinaryUses} />
                            </ListItem>
                        )}
                        {item.storageInstructions && (
                            <ListItem key={`${item.id}-storage-instructions`}>
                                <ListItemText primary="Storage Instructions" secondary={item.storageInstructions} />
                            </ListItem>
                        )}
                        {item.dateAdded && (
                            <ListItem key={`${item.id}-date-added`}>
                                <ListItemText
                                    primary="Date Added"
                                    secondary={new Date(item.dateAdded.seconds * 1000).toLocaleDateString()}
                                />
                            </ListItem>
                        )}
                        {item.lastUpdated && (
                            <ListItem key={`${item.id}-last-updated`}>
                                <ListItemText
                                    primary="Last Updated"
                                    secondary={new Date(item.lastUpdated.seconds * 1000).toLocaleDateString()}
                                />
                            </ListItem>
                        )}
                    </List>
                </Collapse>
            </CardContent>

            <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                <IconButton
                    onClick={() => { onUpdateQuantity(item.id, 1) }}
                    color="primary"
                    aria-label="increase quantity"
                >
                    <AddIcon />
                </IconButton>
                <IconButton
                    onClick={() => { onUpdateQuantity(item.id, -1) }}
                    color="seconday"
                    aria-label="decrease quantity"
                >
                    <RemoveIcon />
                </IconButton>
            </CardActions>
        </Card>
    )
})

Component_InventoryItemCard.displayName = 'Component_InventoryItemCard'

export default Component_InventoryItemCard