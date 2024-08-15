'use client'
import { classifyImage } from './imageClassification'
import { useState, useEffect } from 'react'
import { firestore, storage } from '@/firebase'
import { useMediaQuery, useTheme, CircularProgress, Box, Modal, TextField, Typography, Stack, Button, AppBar, Toolbar, Container, InputAdornment, Grid, Card, CardContent, CardActions, IconButton } from '@mui/material'
import { Add as AddIcon, Remove as RemoveIcon, Search as SearchIcon } from '@mui/icons-material'
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from 'firebase/firestore'
import CameraCapture from './CameraCapture'
import { resizeImage} from './imageUtils'

export default function Home() {
    const [inventory, setInventory] = useState([])
    const [open, setOpen] = useState(false)
    const [itemName, setItemName] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [capturedImage, setCapturedImage] = useState(null)
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleCapture = (imageDataUrl) => {
        setCapturedImage(imageDataUrl)
    }

    // update inventory
    const updateInventory = async () => {
        const snapshot = query(collection(firestore, 'inventory'))
        const docs = await getDocs(snapshot)
        const inventoryList = []

        docs.forEach((doc) => {
            inventoryList.push({
                name: doc.id,
                ...doc.data()
            })
        })
        setInventory(inventoryList)
    }

    const removeItem = async (item) => {
        setIsLoading(true)
        try {
            const docRef = doc(firestore, 'inventory', item)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const { quantity } = docSnap.data()
                if (quantity === 1) {
                    await deleteDoc(docRef)
                } else {
                    await setDoc(docRef, { quantity: quantity - 1 }, { merge: true })
                }
            }
            await updateInventory()
        } catch (error) {
            console.error("Error removing item", error)
        } finally {
            setIsLoading(true)
        }
    }

    useEffect(() => {
        updateInventory()
    }, [])


 const addItem = async (item, isExisting = false) => {
        if (!item.trim()) {
            console.error("Item name cannot be empty");
            return;
        }

        setIsLoading(true);

        try {
            const docRef = doc(collection(firestore, 'inventory'), item.trim());
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Document exists, updating");
                const existingData = docSnap.data();
                const updatedData = {
                    quantity: (existingData.quantity || 0) + 1,
                };

                // Only include fields that are not undefined
                if (existingData.imageUrl) updatedData.imageUrl = existingData.imageUrl;
                if (existingData.description) updatedData.description = existingData.description;
                if (existingData.categories) updatedData.categories = existingData.categories;

                await setDoc(docRef, updatedData, { merge: true });
            } else {
                console.log("Document doesn't exist, creating new");
                let newData = {
                    quantity: 1
                };

                if (!isExisting && capturedImage) {
                    const resizedImage = await resizeImage(capturedImage, 800);
                    newData.imageUrl = resizedImage;
                    const classification = await classifyImage(resizedImage);
                    if (classification) {
                        const classificationObj = JSON.parse(classification);
                        newData.description = classificationObj.description;
                        newData.categories = classificationObj.categories;
                        console.log("Image classified:", classificationObj);
                    }
                }

                await setDoc(docRef, newData);
            }

            console.log("Document updated/created successfully");
            await updateInventory();
            if (!isExisting) {
                setCapturedImage(null);
                setItemName('');
            }
        } catch (e) {
            console.error("Error adding item:", e);
        } finally {
            setIsLoading(false);
        }
    };

const handleOpen = () => setOpen(true)
const handleClose = () => {
        setOpen(false)
        setCapturedImage(null)
        setItemName('')
    }

const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()))


return (
    <Box sx={{ flexGrow: 1 }}>
        <AppBar position='static' sx={{ backgroundColor: '#2E7D32' }}>
            <Toolbar>
                <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                    Pantry Inventory
                </Typography>
                <Button color="inherit" onClick={handleOpen}>Add New Item</Button>
            </Toolbar>
        </AppBar>

        <Modal open={open} onClose={handleClose}>
            <Box
                sx={{
                    top: "50%", 
                    left: "50%",
                    position: "absolute",
                    transform: 'translate(-50%, -50%)',
                    maxHeight: '90vh',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    width: isMobile ? '90%' : 600,
                }}>

                <Typography variant="h6" component='h2' sx={{ mb: 2 }}>Add New Item</Typography>
                <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                <TextField
                    autoFocus
                    margin='dense'
                    label="Item Name"
                    fullWidth
                    variant="outlined"
                    value={itemName} 
                    onChange={(e) => { setItemName(e.target.value) }}
                />
                 <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                <CameraCapture onCapture={handleCapture} />
                </Box>
                {capturedImage && (
                    <Box sx={{ mt: 2 }}>
                        <img src={capturedImage} alt="Captured item" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', marginTop: '10px' }} />
                    </Box>
                )}
                </Box>
                </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Button 
                            variant="contained"
                            fullWidth
                            disabled={isLoading || !itemName.trim()}
                            onClick={() => {
                                addItem(itemName)
                            }}>{isLoading ? 'Adding...' : 'Add Item'}</Button>
                        {isLoading && <CircularProgress size={24} sx={{ ml:2 }} />}
                    </Box>
                </Box>
        </Modal>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 4 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position='start'>
                            <SearchIcon />
                        </InputAdornment>
                    )
                }}
            />
            <Grid container spacing={3}>
                {filteredInventory.map(({ name, quantity, imageUrl }) => (
                    <Grid item xs={12} sm={6} md={4} key={name}>
                        <Card>
                            {imageUrl && (
                                <img src={imageUrl} alt={name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            )}
                            <CardContent>
                                <Typography variant='h5' component='div'>{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                                <Typography variant='h6' color='text.secondary'>Quantity: {quantity}</Typography>
                            </CardContent>
                            <CardActions>
                                <IconButton onClick={() => { addItem(name, true) }} color="primary">
                                    <AddIcon />
                                </IconButton>
                                <IconButton onClick={() => { removeItem(name) }} color="secondary">
                                    <RemoveIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>

    </Box>
)
}

