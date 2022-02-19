import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';

export default function FoodCard({ img = '', title = '', height = '200px' }) {
  return (
    <Card sx={{ margin: '5px' }}>
      <CardActionArea>
        <CardMedia component="img" height={height} image={img} alt="chicken" />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            {title}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
