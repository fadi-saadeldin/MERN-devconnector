const Validator =require('validator');
const isEmpty =require('./is-empty');
module.exports=function validateRegiterInput(data){
    let errors={};
   
    data.name=!isEmpty(data.name)? data.name:'';
    data.email=!isEmpty(data.email)? data.email:'';
    data.password=!isEmpty(data.password)? data.password:'';
    data.password2=!isEmpty(data.password2)? data.password2:'';
    console.log(data);
    if(!Validator.isLength(data.name,{min:2,max:30})){
        errors.name='Name must be between 2 and 30 char';

    }
    if(Validator.isEmpty(data.name)){
        errors.name='Name field is requird';
    }
    if(Validator.isEmpty(data.email)){
        errors.email='email field is requird';
    }
    if(Validator.isEmpty(data.password)){
        errors.password='password field is requird';
    }
    if(Validator.isEmpty(data.password2)){
        errors.password2='password2 field is requird';
    }
    // if(Validator.equals(data.password,data.password2)){
    //     errors.password2='passwords must match';
    // }
    return{
        errors,
        isValid:isEmpty(errors)
    }
}