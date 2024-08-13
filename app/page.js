'use client'
import { useState, useEffect } from 'react'
import { firestore } from '@/firebase'
import { Box, Modal, TextField, Typography, Stack, Button, AppBar, Toolbar, Container, InputAdornment, Grid, Card, CardContent, CardActions, IconButton } from '@mui/material'
import { Add as AddIcon, Remove as RemoveIcon, Search as SearchIcon } from '@mui/icons-material'
import { collection, deleteDoc, doc, DocumentReference, Firestore, getDoc, getDocs, query, setDoc } from 'firebase/firestore'

export default function Home() {
    const [inventory, setInventory] = useState([])
    const [open, setOpen] = useState(false)
    const [itemName, setItemName] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

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
        const docRef = doc(collection(firestore, 'inventory'), item)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const { quantity } = docSnap.data()
            if (quantity === 1) {
                await deleteDoc(docRef)
            } else {
                await setDoc(docRef, { quantity: quantity - 1 })

            }
        }

        await updateInventory()
    }

    useEffect(() => {
        updateInventory()
    }, [])


    const addItem = async (item) => {
        const docRef = doc(collection(firestore, 'inventory'), item)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const { quantity } = docSnap.data()
            await setDoc(docRef, { quantity: quantity + 1 })
        } else {
            await setDoc(docRef, { quantity: 1 })
        }

        await updateInventory()
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
                        value={itemName} onChange={(e) => {setItemName(e.target.value)}}
                    />
                    <Button variant="outlined" 
                        sx={{mt:2}}
                        onClick={() => {
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
                    {filteredInventory.map(({ name, quantity }) => (
                        <Grid item xs={12} sm={6} md={4} key={name}>
                            <Card>
                                <CardContent>
                                    <Typography variant='h5' component='div'>{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                                    <Typography variant='h6' color='text.secondary'>Qauntity: {quantity}</Typography>
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
