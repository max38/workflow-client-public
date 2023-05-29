export default `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:collaboration id="Collaboration_1qq1am2">
    <bpmn2:participant id="Participant_1xqkf1h" name="Pool1" processRef="Process_1" />
  </bpmn2:collaboration>
  <bpmn2:process id="Process_1">
    <bpmn2:laneSet id="LaneSet_1yijipe">
      <bpmn2:lane id="Lane_0cp0rti" name="id_1">
        <bpmn2:flowNodeRef>StartEvent_18ktykv</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_0qz6rn4</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_04hkkce</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>EndEvent_1vgnv7y</bpmn2:flowNodeRef>
      </bpmn2:lane>
    </bpmn2:laneSet>
    <bpmn2:startEvent id="StartEvent_18ktykv" name="Start">
      <bpmn2:outgoing>SequenceFlow_1g7v2nr</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:task id="Task_0qz6rn4" name="Task1">
      <bpmn2:incoming>SequenceFlow_1g7v2nr</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_0fdb103</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:sequenceFlow id="SequenceFlow_1g7v2nr" sourceRef="StartEvent_18ktykv" targetRef="Task_0qz6rn4" />
    <bpmn2:sequenceFlow id="SequenceFlow_0fdb103" sourceRef="Task_0qz6rn4" targetRef="Task_04hkkce" />
    <bpmn2:sequenceFlow id="SequenceFlow_0h6fka4" sourceRef="Task_04hkkce" targetRef="EndEvent_1vgnv7y" />
    <bpmn2:task id="Task_04hkkce" name="Task2">
      <bpmn2:incoming>SequenceFlow_0fdb103</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_0h6fka4</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:endEvent id="EndEvent_1vgnv7y" name="End">
      <bpmn2:incoming>SequenceFlow_0h6fka4</bpmn2:incoming>
    </bpmn2:endEvent>
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1qq1am2">
      <bpmndi:BPMNShape id="Participant_1xqkf1h_di" bpmnElement="Participant_1xqkf1h">
        <dc:Bounds x="261" y="204" width="788" height="312" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_0cp0rti_di" bpmnElement="Lane_0cp0rti">
        <dc:Bounds x="291" y="204" width="758" height="312" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="StartEvent_18ktykv_di" bpmnElement="StartEvent_18ktykv">
        <dc:Bounds x="398" y="288" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="404" y="331" width="24" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_0qz6rn4_di" bpmnElement="Task_0qz6rn4">
        <dc:Bounds x="535" y="266" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_1g7v2nr_di" bpmnElement="SequenceFlow_1g7v2nr">
        <di:waypoint x="434" y="306" />
        <di:waypoint x="535" y="306" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Task_04hkkce_di" bpmnElement="Task_04hkkce">
        <dc:Bounds x="726" y="266" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_0fdb103_di" bpmnElement="SequenceFlow_0fdb103">
        <di:waypoint x="635" y="306" />
        <di:waypoint x="726" y="306" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="EndEvent_1vgnv7y_di" bpmnElement="EndEvent_1vgnv7y">
        <dc:Bounds x="907" y="288" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="915" y="331" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_0h6fka4_di" bpmnElement="SequenceFlow_0h6fka4">
        <di:waypoint x="826" y="306" />
        <di:waypoint x="907" y="306" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>
`;