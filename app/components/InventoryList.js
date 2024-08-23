import { Fade, Grid } from '@mui/material'
import InventoryItem from "./InventoryItemCard";

const InventoryList = (
    { items,
        onUpdateQuantity,
        onAcceptClassifiedName }
) => {
    return (
        <Grid container spacing={3}>
            {items.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Fade in={true} timeout={500}>
                        <div>
                            <InventoryItem
                                item={item}
                                onUpdateQuantity={onUpdateQuantity}
                                onAcceptClassifiedName={onAcceptClassifiedName}
                            />
                        </div>
                    </Fade>


                </Grid>
            ))}
        </Grid>
    )
}

export default InventoryList