'use client'
import { classifyImage } from './imageClassification'
import { useState, useEffect } from 'react'
import { firestore, storage } from '@/firebase'
import { Box, Modal, TextField, Typography, Stack, Button, AppBar, Toolbar, Container, InputAdornment, Grid, Card, CardContent, CardActions, IconButton } from '@mui/material'
import { Add as AddIcon, Remove as RemoveIcon, Search as SearchIcon } from '@mui/icons-material'
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from 'firebase/firestore'
import CameraCapture from './CameraCapture'

export default function Home() {
    const [inventory, setInventory] = useState([])
    const [open, setOpen] = useState(false)
    const [itemName, setItemName] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [capturedImage, setCapturedImage] = useState(null)

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
    }

    useEffect(() => {
        updateInventory()
    }, [])


    const addItem = async (item) => {
        if (!item.trim()) {
            console.error("Item name cannot be empty");
            return;
        }

        try {
            const docRef = doc(collection(firestore, 'inventory'), item.trim())
            console.log("Document reference created");
            const docSnap = await getDoc(docRef)
            console.log("Document snapshot retrieved");

            let newData = {
                quantity: 1
            }
            if (capturedImage) {
                console.log("Captured image found, adding to newData");
                newData.imageUrl = capturedImage
                const classification = await classifyImage(capturedImage)
                if (classification) {
                    newData.classificaton = classification;
                    console.log("Image classified:", classification)
                }
            }

            if (docSnap.exists()) {
            console.log("Document exists, updating");
            const existingData = docSnap.data()
            await setDoc(docRef, {
                quantity: existingData.quantity + 1,
                imageUrl: capturedImage || existingData.imageUrl,
                classification: newData.classification || existingData.classification
            }, { merge: true })
        } else {
            console.log("Document doesn't exist, creating new");
            await setDoc(docRef, newData)
        }

        console.log("Document updated/created successfully");
        await updateInventory()
        setCapturedImage(null)
        setItemName('')
    } catch (e) {
        console.error("Error adding item:", e)
    }
}

const handleOpen = () => setOpen(true)
const handleClose = () => setOpen(false)
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
                    top: "50%", left: "50%",
                    position: "absolute",
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4
                }}>

                <Typography variant="h6" component='h2' sx={{ mb: 2 }}>Add New Item</Typography>
                <TextField
                    autoFocus
                    margin='dense'
                    label="Item Name"
                    fullWidth
                    variant="outlined"
                    value={itemName} onChange={(e) => { setItemName(e.target.value) }}
                />
                <CameraCapture onCapture={handleCapture} />
                {capturedImage && (
                    <Box sx={{ mt: 2 }}>
                        <img src={capturedImage} alt="Captured item" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', marginTop: '10px' }} />
                    </Box>
                )}

                <Button variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => {
                        console.log("Add Item button clicked");
                        console.log("Item Name:", itemName);
                        console.log("Captured Image captured No image")
                            addItem(itemName)
                            setItemName('')
                            handleClose()
                        }}>Add Item</Button>
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
                                <IconButton onClick={() => { addItem(name) }} color="primary">
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

