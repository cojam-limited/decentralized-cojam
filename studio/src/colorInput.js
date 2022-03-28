/**
 * A basic text input that expects the user to enter a hex code, which will be used to display
 * a square colored with the input's value
 */
 import React from 'react'
 import { func, shape, string } from 'prop-types'
 import styled from 'styled-components'
 
 // Important items to allow form fields to work properly and patch the dataset.
 import { PatchEvent, set } from 'part:@sanity/form-builder/patch-event'
 import FormField from 'part:@sanity/components/formfields/default'
 import { TextInput } from '@sanity/ui'
 
 const propTypes = {
   onChange: func.isRequired,
   type: shape({
     title: string.isRequired,
     description: string.isRequired
   }).isRequired
 }
 
 const ColorInputWrapper = styled.div`
   display: flex;
 
   /* Set text input's wrapper to fill empty row space */
   & > span {
     flex-grow: 1;
   }
 `
 
 const ColorSwatch = styled.div`
   height: 39px;
   width: 39px;
   background-color: ${(props) => `#${props.swatchColor}`};
   border: 1px solid #cad1dc;
   margin-right: 10px;
 `
 
 /**
  * Match styles of the default text input used by the other fields, which is older and slightly
  * different than the newer Sanity UI's TextInput used here
  */
 const StyledTextInput = styled(TextInput)`
   background-color: #ffffff;
   border: 1px solid #cad1dc;
   border-radius: 2px;
   padding: calc(0.75rem - 3px) calc(0.75rem - 1px) calc(0.75rem - 2px);
   color: #262f3d;
   line-height: 20px;
 
   &:hover {
     box-shadow: none;
     border-color: #95a3b9;
   }
 `
 
 const Color = React.forwardRef((props, ref) => {
   const { type, onChange } = props
 
   return (
     <FormField label={type.title} description={type.description}>
       <ColorInputWrapper>
         <ColorSwatch swatchColor={props.value || 'FFF'} />
         <StyledTextInput
           type='text'
           ref={ref}
           value={props.value}
           onChange={(event) => {
             onChange(PatchEvent.from(set(event.target.value)))
           }}
         />
         <StyledTextInput
           type='text'
           name="another"
           value={props.value}
           onChange={(event) => {
             onChange(PatchEvent.from(set(event.target.value)))
           }}
         />
       </ColorInputWrapper>
     </FormField>
   )
 })
 
 Color.propTypes = propTypes
 
 export default Color