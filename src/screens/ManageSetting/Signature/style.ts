import { StyleSheet } from 'react-native';
import { colors } from '../../../styles/colors';


export default StyleSheet.create({
  container: 
    { flex: 1, backgroundColor: colors.white },
    content:{
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
    },
    signatureImage:{
      width:"90%",
      height:300,
      resizeMode:"contain"
    }

});
