import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {Animated, Share, Pressable, Modal, TouchableHighlight, StyleSheet, Text, View, Button, ActivityIndicator } from 'react-native';

import { initializeApp } from "firebase/app";
//import { getMessaging, getToken } from "firebase/messaging";
//import { getMessaging, getToken } from "firebase/messaging/sw";
import * as Analytics from 'expo-firebase-analytics';

import getInstallationIdAsync from 'expo/build/environment/getInstallationIdAsync';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'

export default function App() {
  const apiUrl = "http://local.proktek.com.tr:65333/"
  const [apiRepsonse, setApiRepsonse] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [garageStatus, setGarageStatus] = useState('open');
  const [deviceId, setDeviceId] = useState('Cihaz kimliği bulunamadı!');
  const [countDownRunning, setCountDownRunning] = useState(false);
  const [kalanSure, setKalanSure] = useState(5);
  const [progressVisible, setProgressVisible] = useState(false);
  
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAsNm5UH-l9hWurlHb-Z2Jh4QDDDWWzA8E",
    authDomain: "proktekgarageremote.firebaseapp.com",
    projectId: "proktekgarageremote",
    storageBucket: "proktekgarageremote.appspot.com",
    messagingSenderId: "674831099323",
    appId: "1:674831099323:web:d994ebb1caddd8dc0a109e",
    measurementId: "G-HZLH2BL4CC"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  //const messaging = getMessaging(app);

  async function getdeviceId() {
    try{ 
      setDeviceId('' + await getInstallationIdAsync());
      /*
      let uuid = uuidv4();
      await SecureStore.setItemAsync('secure_deviceid', JSON.stringify(uuid));
      let fetchUUID = await SecureStore.getItemAsync('secure_deviceid');
      setDeviceId(fetchUUID);
      */
      //let tokennn = getToken;
      //setDeviceId('Error:' + tokennn)
      //return

      /*
      await getToken(messaging, { vapidKey: 'BLdxfDH_UDMBrPWzD8ANkOmDRt-kDsnpCRpaK-KUTVU2xSVUJXHUKh9lPSlq-cE20GzN--OS6uqRHSb3bk45UPc' })
      .then((currentToken) => {
        if (currentToken) {
          setDeviceId('' + currentToken)
          // Send the token to your server and update the UI if necessary
          // ...
        } else {
          // Show permission request UI
          console.log('No registration token available. Request permission to generate one.');
          // ...
        }
      }).catch((err) => {
        setDeviceId('ErrorIntoToken:' + err)
        console.log('An error occurred while retrieving token. ', err);
        // ...
      });
      */

      //setDeviceId('' + getToken());
      return
    } catch(e) { setDeviceId('Error:' + e); console.error(e); }
  };

  const onShare = async () => {
    try {
      const result = await Share.share({
       title: 'Device Id',
        message: deviceId, 
        //url: 'https://play.google.com/store/apps/details?id=nic.goi.aarogyasetu&hl=en'
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const CustomProgressBar = ({ visible }) => (
    <Modal onRequestClose={() => null} visible={visible}>
      <View style={{ flex: 1, backgroundColor: '#dcdcdc', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ borderRadius: 10, backgroundColor: 'white', padding: 25 }}>
          <Text style={{ fontSize: 20, fontWeight: '200', padding:10 }}>Lütfen bekleyiniz</Text>
          <ActivityIndicator size="large" />
        </View>
      </View>
    </Modal>
  );

  useEffect(() => {
    getdeviceId();
  }, []);

  function confirmGarageOpen(){
    setGarageStatus('open'); 
    setShowConfirm(true);
    setCountDownRunning(true);
  }

  function confirmGarageClose(){
    setGarageStatus('close'); 
    setShowConfirm(true);
    setCountDownRunning(true);
  }

  function cancelGarageCommand(){
    setCountDownRunning(false);
    setShowConfirm(false);
  }

  async function commitGarageCommand(){
    setCountDownRunning(false);
    setShowConfirm(false);
    if (garageStatus == 'open'){
      await garageOpen(true);
    }
  }

  async function garageOpen(status) {
    try {
      setProgressVisible(true);
      (await fetch(apiUrl + 'open'))
      .json()
      .then(res => {
        setProgressVisible(false);
        setMessage(res.success ? "Bariyeri açma emri gönderildi!" : apiRepsonse.response);
        setApiRepsonse(res);
        setShowMessage(true);
        Analytics.logEvent('ProktekGarage', res);
      })
      .catch((error) => {        
        setProgressVisible(false);
        console.log(error);
        setMessage('Hata: ' + error.message);
        setApiRepsonse({response: error.message, success:false});
        setShowMessage(true);
        Analytics.logEvent('ProktekGarage', error);
      });
      Analytics.logEvent('ProktekGarage', {garage: 'Open', deviceId: deviceId});
    }
    catch (error){
      setProgressVisible(false);
      console.log(error);
      setMessage('Hata: ' + error.message);
      setApiRepsonse({response: error.message, success:false});
      setShowMessage(true);
      Analytics.logEvent('ProktekGarage', error);
    }
  }

  async function garageTest() {
    try {
      setProgressVisible(true);
      (await fetch(apiUrl + 'test'))
      .json()
      .then(res => {
        setProgressVisible(false);
        setMessage(res.success ? "Aygıt ile bağlantı başarılı." : apiRepsonse.response);
        setApiRepsonse(res);
        setShowMessage(true);
        Analytics.logEvent('ProktekGarage', res);
      })
      .catch((error) => {        
        setProgressVisible(false);
        console.log(error);
        setMessage('Hata: ' + error.message);
        setApiRepsonse({response: error.message, success:false});
        setShowMessage(true);
        Analytics.logEvent('ProktekGarage', error);
      });
      Analytics.logEvent('ProktekGarage', {garage: 'Open', deviceId: deviceId});
    }
    catch (error){
      setProgressVisible(false);
      console.log(error);
      setMessage('Hata: ' + error.message);
      setApiRepsonse({response: error.message, success:false});
      setShowMessage(true);
      Analytics.logEvent('ProktekGarage', error);
    }
  }

  return (
    <View style={styles.container}>
      <CustomProgressBar visible={progressVisible} />
      <Modal
        animationType="fade"
        transparent={false}
        visible={showMessage}
      >  
        <View style={styles.centeredView}>                
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{message}</Text>
            <Pressable
              style={[styles.button, apiRepsonse.success ? styles.buttonOk : styles.buttonCancel]}
              onPress={() => setShowMessage(!showMessage)}
            >
              <Text style={styles.textStyle}>TAMAM</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={false}
        visible={showConfirm}
      >  
        <View style={styles.centeredView}>

          <CountdownCircleTimer
            isPlaying={countDownRunning}
            duration={5}
            colors={[
              ['#FF0000', 0.2],
              ['#8b0000', 0.3],
              ['#006400', 0.4],
              ['#32cd32', 0.1],
            ]}
            onComplete={() => [commitGarageCommand()]}
          >
            {({ remainingTime, animatedColor }) => {
              setKalanSure(remainingTime);
              return (
              <Animated.Text style={{ color: animatedColor, fontSize: 40 }}>
                {remainingTime}
              </Animated.Text>
            );}}
          </CountdownCircleTimer>                
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Bariyer 5 saniye içerisinde {garageStatus == 'open' ? 'açılacaktır' : 'kapatılacaktır'}</Text>
            <Pressable
              style={[styles.button, styles.buttonOk]}
              onPress={() => commitGarageCommand()}
            >
              <Text style={styles.textStyle}>TAMAM ({kalanSure})</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonCancel]}
              onPress={() => cancelGarageCommand()}
            >
              <Text style={styles.textStyle}>İPTAL</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <View style={styles.openclosebuttons}>
        <TouchableHighlight
          style={[styles.button, styles.buttonOpen]}
          onPress={() => confirmGarageOpen()}
        >
          <Text style={styles.textStyle}>BARİYERİ AÇ</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={[styles.button, styles.buttonCancel]}
          onPress={() => garageTest()}
        >
          <Text style={styles.textStyle}>BAĞLANTI TEST</Text>
        </TouchableHighlight>
      </View>
      <View style={styles.deviceid}>
        <Text style={styles.padding}>Device ID: {deviceId}</Text>
        <Button title="Id Paylaş" style={styles.buttonShare} onPress={onShare}></Button>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  padding: {
    paddingTop:10
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openclosebuttons: {
    width:"100%",
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceid: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width:"70%",
    borderRadius: 10,
    padding: 20,
    marginTop:20,
    elevation: 2,
    alignItems: "center",
    backgroundColor: "forestgreen",
  },  
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 0,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.0,
    shadowRadius: 0,
    elevation: 0
  },
  buttonOpen: {
    padding: 40,
    backgroundColor: "dodgerblue",
  },
  buttonClose: {
    padding: 30,
    backgroundColor: "red",
  },
  buttonOk: {
    width:200,
    padding:15,
    backgroundColor: "green",
  },
  buttonOkGray: {
    width:200,
    padding:15,
    backgroundColor: "#444",
  },
  buttonCancel: {
    width:200,
    padding:15,
    backgroundColor: "red",
  },
  buttonShare: {
    backgroundColor: "red",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 22
  },
  modalText: {
    fontSize: 20,
    marginBottom: 15,
    textAlign: "center"
  }
});
